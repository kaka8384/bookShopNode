var express = require('express');
var router = express.Router();
let Product=require('../models/product');
let moment=require('moment');
let constants=require('../constants/constants');
let auth=require('../utils/auth');
let utils=require('../utils/utils');

//添加产品
router.post('/AddProduct', function(req, res, next) {
    if(!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let product = req.body;
        var newModel=new Product(product);
        newModel.save((err, product)=>{
            if(err){
                res.status(500).send({
                    success: false,
                    error: err
                });
            }else {
                res.send({
                    success: true,
                    product: product
                });
            }
        });
    }
});

//修改产品
router.put('/UpdateProduct/:productId', function(req, res, next) {
    if(!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let productId = req.params.productId;
        let product = req.body;
        product.updated=moment().format();
        let newModel= Object.assign({}, product);
        Product.findOneAndUpdate({_id:productId}, newModel, {new: true}, (err, product)=>{
            if(err){
                res.status(500).send({
                    success: false,
                    error: err
                });
            }else {
                res.send({
                    success: true,
                    product: product
                });
            }
        });
    }
});

//删除产品
router.delete('/DeleteProduct/:productId', function(req, res, next) {
    if(!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let productId = req.params.productId;
        Product.remove({_id: productId}, (err)=>{
            if (err) {
                res.status(500).send({
                    success: false,
                    error: err
                });
            } else {
                res.send({
                    success: true,
                    productId:productId
                });
            }
        });
    }
});

//批量删除商品
router.delete('/BatchDeleteProduct', function(req, res, next) {
    if(!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let productIds = req.body.productIds;
        Product.remove({_id: {$in:productIds}}, (err)=>{
            if (err) {
                res.status(500).send({
                    success: false,
                    error: err
                });
            } else {
                res.send({
                    success: true,
                    productIds:productIds
                });
            }
        });
    }
});

//分页查询产品
//param:queryType(查询类型 1.网站查询 2.后台查询)
router.get('/ProductByPage', function(req, res, next) {
    let {currentPage,name,descption,author,publisher,inventory,publicationTime_S,publicationTime_E,minPrice,maxPrice,pageSize,isActive,sorter,queryType=1}=req.query;
    if(queryType===2&&!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let limit = pageSize?parseInt(pageSize):constants.PAGE_SIZE;
        let skip = (currentPage - 1) * limit;
        let queryCondition = {}; 
        let sortCondition = {};
        if(name){
            queryCondition['name'] = new RegExp(name);
        }
        if(descption){
            queryCondition['descption'] = new RegExp(descption);
        }
        if(author){
            queryCondition['bookAttribute.author'] = new RegExp(author);
        }
        if(publisher){
            queryCondition['bookAttribute.publisher'] = new RegExp(publisher);
        }
        if(inventory)
        {
            queryCondition['inventory'] =inventory;
        }
        if(publicationTime_S&&publicationTime_E)
        {
            Object.assign(queryCondition,{"bookAttribute.publicationTime":{$gte:publicationTime_S,$lte:publicationTime_E}});
        }
        if(minPrice)
        {
            Object.assign(queryCondition,{"price":{$gte:minPrice}});
        }
        if(maxPrice)
        {
            Object.assign(queryCondition,{"price":{$lte:maxPrice}});
        }
        if(isActive)
        {
            queryCondition['isActive'] = isActive;
        }
        if(sorter)
        {
            let sortField=utils.getSortField(sorter);
            let sortType=utils.getSortType(sorter);
            switch(sortField)
            {
                case "price.$numberDecimal": //价格排序
                Object.assign(sortCondition,{"price":sortType});    
                break;
                case "salesCount": //销量排序
                Object.assign(sortCondition,{"salesCount":sortType});    
                break;
                case "commentCount": //评论数排序
                Object.assign(sortCondition,{"commentCount":sortType});    
                break;
                case "bookAttribute.publicationTime": //出版时间排序
                Object.assign(sortCondition,{"bookAttribute.publicationTime":sortType});    
                break;
                case "updated": //更新时间排序
                Object.assign(sortCondition,{"updated":sortType});    
                break;
            }
        }
        else
        {
            Object.assign(sortCondition,{"updated":-1}); // 默认按更新时间倒序    
        }
        Product.countDocuments(queryCondition, (err, count)=>{
            Product.find(queryCondition)
                .sort(sortCondition)
                .limit(limit)
                .skip(skip)
                .exec((err, products)=>{
                    if(err){
                        res.status(500).send({
                            success: false,
                            error: err
                        });
                    }else {
                        res.send({
                            success: true,
                            list: products,
                            pagination: {
                                total: count,
                                current: parseInt(currentPage)
                            }
                        });
                    }
                });
        });
    }  
});

//查询单个产品
router.get('/ProductQuery', function(req, res, next) {
    let {pid,queryType=1}=req.query;
    if(queryType===2&&!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        Product.findByProductId(pid,function(err, item){
            if(err){
                res.status(500).send({
                    error:err
                });
            }
            else
            {
                res.send({
                    success: true,
                    item:item
                });
            }
        })
    }
});

module.exports = router;