var express = require('express');
var router = express.Router();
let Category=require('../models/category');
let moment=require('moment');
let constants=require('../constants/constants');
let auth=require('../utils/auth');
let utils=require('../utils/utils');
let errorcodes=require('../constants/errorCodes');

//添加分类
router.post('/AddCatgeory', function(req, res, next) {
    if(!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let category = req.body;
        var newModel=new Category(category);
        newModel.save((err, category)=>{
            if(err){
                res.status(500).send({
                    success: false,
                    error: err
                });
            }else {
                res.send({
                    success: true,
                    category: category
                });
            }
        });
    }
});

//删除分类
router.delete('/DeleteCatgeory/:categoryId', function(req, res, next) {
    if(!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let categoryId = req.params.categoryId;
        Category.remove({_id: categoryId}, (err)=>{
            if (err) {
                res.status(500).send({
                    success: false,
                    error: err
                });
            } else {
                res.send({
                    success: true,
                    categoryId:categoryId
                });
            }
        });
    }
});

//批量删除分类
router.delete('/BatchDeleteCatgeory', function(req, res, next) {
    if(!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let categoryIds = req.body.categoryIds;
        Category.remove({_id: {$in:categoryIds}}, (err)=>{
            if (err) {
                res.status(500).send({
                    success: false,
                    error: err
                });
            } else {
                res.send({
                    success: true,
                    categoryIds:categoryIds
                });
            }
        });
    }
});

//修改分类
router.put('/UpdateCatgeory/:categoryId', function(req, res, next) {
    if(!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let categoryId = req.params.categoryId;
        let category = req.body;
        category.updated=moment().format();
        let newCatgeory = Object.assign({}, category);
        Category.findOneAndUpdate({_id:categoryId}, newCatgeory, {new: true}, (err, category)=>{
            if(err){
                res.status(500).send({
                    success: false,
                    error: err
                });
            }else {
                res.send({
                    success: true,
                    category: category
                });
            }
        });
    }
});

//查询所有分类
router.get('/AllCatgeory', function(req, res, next) {
    Category.find({}, (err, categories)=> {
        if(err){
            res.status(500).send({
                success: false,
                error: err
            });
        }else {
            res.send({
                success: true,
                categories: categories
            });
        }
    })
});

//查询单个分类
router.get('/CategoryQuery', function(req, res, next) {
    let {cid,queryType=1}=req.query;
    if(queryType===2&&!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        Category.findByCategoryId(cid,function(err, item){
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

//分页查询分类
router.get('/CatgeoryByPage', function(req, res, next) {
    if(!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let {currentPage, pageSize,name,sorter}=req.query;
        let limit = pageSize?parseInt(pageSize):constants.PAGE_SIZE;
        let skip = (currentPage - 1) * limit;
        let queryCondition = {};
        let sortCondition = {};
        if(sorter)
        {
            let sortField=utils.getSortField(sorter);
            let sortType=utils.getSortType(sorter);
            switch(sortField)
            {
                case 'name':
                    Object.assign(sortCondition,{'name':sortType}); 
                    break;
                case 'updated':
                    Object.assign(sortCondition,{'updated':sortType}); 
                    break;
            }
        }   
        if(name){
            queryCondition['name'] = new RegExp(name);
        }
        Category.countDocuments(queryCondition, (err, count)=>{
            Category.find(queryCondition)
                .sort(sortCondition)
                .limit(limit)
                .skip(skip)
                .exec((err, catgeories)=>{
                    if(err){
                        res.status(500).send({
                            success: false,
                            error: err
                        });
                    }else {
                        res.send({
                            success: true,
                            list: catgeories,
                            pagination: {
                                total: count,
                                current:parseInt(currentPage)
                            }
                        });
                    }
                });
        });
    }   
});

module.exports = router;