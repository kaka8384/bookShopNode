var express = require('express');
var router = express.Router();
let Category=require('../models/category');
let moment=require('moment');
let constants=require('../constants/constants');
let auth=require('../utils/auth');
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
                res.send({
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
                res.send({
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
    Category.find({}, (err, catgeories)=> {
        if(err){
            res.send({
                success: false,
                error: err
            });
        }else {
            res.send({
                success: true,
                catgeories: catgeories
            });
        }
    })
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
        let {currentPage, pageSize,name}=req.query;
        let limit = pageSize?parseInt(pageSize):constants.PAGE_SIZE;
        let skip = (currentPage - 1) * limit;
        let queryCondition = {};
        if(name){
            queryCondition['name'] = new RegExp(name);
        }
        Category.countDocuments(queryCondition, (err, count)=>{
            Category.find(queryCondition)
                .sort({"updated":-1})
                .limit(limit)
                .skip(skip)
                .exec((err, catgeories)=>{
                    if(err){
                        res.send({
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