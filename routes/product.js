var express = require('express');
var router = express.Router();
let Product=require('../models/product');
let moment=require('moment');
let constants=require('../constants/constants');
let auth=require('../utils/auth');

//添加产品
router.post('/AddProduct', function(req, res, next) {
    if(!auth.isAdminAuth(req))
    {
        res.send({
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
                res.send({
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
        res.send({
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
                res.send({
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
        res.send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let productId = req.params.productId;
        Product.remove({_id: productId}, (err)=>{
            if (err) {
                res.send({
                    success: false,
                    error: err
                });
            } else {
                res.send({
                    success: true
                });
            }
        });
    }
});

//分页查询产品
router.get('/ProductByPage', function(req, res, next) {
    let {page, name,descption,minPrice,maxPrice,rowCount,isActive=true,sort}=req.query;
    let limit = rowCount?rowCount:constants.PAGE_SIZE;
    let skip = (page - 1) * limit;
    let queryCondition = {}; 
    let sortCondition = {};
    if(name){
        queryCondition['name'] = new RegExp(name);
    }
    if(descption){
        queryCondition['descption'] = new RegExp(descption);
    }
    if(minPrice)
    {
        Object.assign(queryCondition,{"price":{$gte:minPrice}});
    }
    if(maxPrice)
    {
        Object.assign(queryCondition,{"price":{$lte:maxPrice}});
    }
    queryCondition['isActive'] = isActive;
    if(sort)
    {
        switch(sort)
        {
            case "1": //价格正序
            Object.assign(sortCondition,{"price":1});    
            break;
            case "2": //价格反序
            Object.assign(sortCondition,{"price":-1});    
            break;
            case "3": //销量正序
            Object.assign(sortCondition,{"salesCount":1});    
            break;
            case "4": //销量反序
            Object.assign(sortCondition,{"salesCount":-1});    
            break;
            case "5": //评论数正序
            Object.assign(sortCondition,{"commentCount":1});    
            break;
            case "6": //评论数反序
            Object.assign(sortCondition,{"commentCount":-1});   
            case "7": //出版时间正序
            Object.assign(sortCondition,{"bookAttribute.publicationTime":1});    
            break;
            case "8": //出版时间反序
            Object.assign(sortCondition,{"bookAttribute.publicationTime":-1});    
            break;
        }
    }
    Product.countDocuments(queryCondition, (err, count)=>{
        Product.find(queryCondition)
            .sort(sortCondition)
            .limit(limit)
            .skip(skip)
            .exec((err, products)=>{
                if(err){
                    res.send({
                        success: false,
                        error: err
                    });
                }else {
                    res.send({
                        success: true,
                        products: products,
                        page: {
                            total: count,
                            current: page
                        }
                    });
                }
            });
    });
});

module.exports = router;