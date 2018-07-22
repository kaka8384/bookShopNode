var express = require('express');
var router = express.Router();
let Category=require('../models/category');
let moment=require('moment');
let constants=require('../constants/constants');

//添加分类
router.post('/AddCatgeory', function(req, res, next) {
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
});

//删除分类
router.delete('/DeleteCatgeory/:categoryId', function(req, res, next) {
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
});

//修改分类
router.put('/UpdateCatgeory/:categoryId', function(req, res, next) {
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

    let {page, categoryName}=req.query;
    let limit = constants.PAGE_SIZE;
    let skip = (page - 1) * limit;
    let queryCondition = {};
    if(categoryName){
        queryCondition['name'] = new RegExp(categoryName);
    }
    Category.count(queryCondition, (err, count)=>{
        Category.find(queryCondition)
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
                        catgeories: catgeories,
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