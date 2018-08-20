var express = require('express');
var router = express.Router();
let Product_Issue=require('../models/product_issue');
let moment=require('moment');
let constants=require('../constants/constants');
let errorcodes=require('../constants/errorCodes');
let auth=require('../utils/auth');

//添加问题
router.post('/AddProductIssue', function(req, res, next) {
    if(!auth.isAuth(req))
    {
        res.send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let currentUser = req.session.userInfo; //当前登录用户信息
        let issue = req.body;
        var newModel=new Product_Issue(issue);
        newModel.customerId=currentUser._id; //赋值提问用户
        newModel.save().then(function(issue){
            res.send({
                success: true,
                issue: issue
            });
     
        }).error(function(err){
            res.send({
                success: false,
                error: err
            });
        });
    }
});

//修改问题
router.put('/UpdateProductIssue/:issueId', function(req, res, next) {
    if(!auth.isAuth(req))
    {
        res.send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let currentUser = req.session.userInfo;
        let issueId = req.params.issueId;
        let issue = req.body;
        if(!currentUser||currentUser._id!==issue.customerId)
        {
            res.send({
                success: false,
                code:errorcodes.NO_DATA_PERMISSION
            });
        }
        else
        {
            issue.updated=moment().format();
            let newModel= Object.assign({}, issue);
            Product_Issue.findOneAndUpdate({_id:issueId}, newModel, {new: true}, (err, issue)=>{
                if(err){
                    res.send({
                        success: false,
                        error: err
                    });
                }else {
                    res.send({
                        success: true,
                        issue: issue
                    });
                }
            });
        }
    }
});

//回答问题
router.put('/AnswerProductIssue/:issueId', function(req, res, next) {
    if(!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let issueId = req.params.issueId;
        let issue = req.body;
        issue.updated=moment().format();
        let newModel= Object.assign({}, issue);
        Product_Issue.findOneAndUpdate({_id:issueId}, newModel, {new: true}, (err, issue)=>{
            if(err){
                res.send({
                    success: false,
                    error: err
                });
            }else {
                res.send({
                    success: true,
                    issue: issue
                });
            }
        });
    }
});

//删除问题
router.delete('/DeleteProductIssue/:issueId', function(req, res, next) {
    if(!auth.isAuth(req))
    {
        res.send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let currentUser = req.session.userInfo;
        let issueId = req.params.issueId;
        let issue = req.body;
        if(!currentUser||currentUser._id!==issue.customerId)
        {
            res.send({
                success: false,
                code:errorcodes.NO_DATA_PERMISSION
            });
        }
        else
        {
            Product_Issue.findByProductIssueId(issueId).exec().then(function(issue){
                if(issue.length<=0) //问题不存在
                {
                    res.send({
                        success: false,
                        code:errorcodes.ISSUE_NOTEXIST
                    });
                }
                else
                {
                    Product_Issue.remove({_id: issue[0]._id}).then(function(){
                        res.send({
                            success: true,
                            comment: issue[0]
                        });
                    })
                    .error(function(err){
                        res.send({
                            success: false,
                            error: err
                        });
                    });
                }
            })
        }
    }
});

//分页查询问题
router.get('/Product_IssueByPage', function(req, res, next) {
    let {currentPage,productId,customerId,issue,answer,issueDate_s,issueDate_e,pageSize}=req.query;
    let limit = pageSize?parseInt(pageSize):constants.PAGE_SIZE;
    let skip = (currentPage - 1) * limit;
    let queryCondition = {}; 
    if(productId){
        queryCondition['productId'] = productId;
    }
    if(customerId){
        queryCondition['customerId'] = customerId;
    }
    if(issue){
        queryCondition['issue'] = new RegExp(issue);
    }
    if(answer){
        queryCondition['answer'] = new RegExp(answer);
    }
    if(issueDate_s)
    {
        Object.assign(queryCondition,{"issueDate":{$gte:issueDate_s}});
    }
    if(issueDate_e)
    {
        Object.assign(queryCondition,{"issueDate":{$lte:issueDate_e}});
    }
    Product_Issue.countDocuments(queryCondition, (err, count)=>{
        Product_Issue.find(queryCondition)
            .sort({"issueDate":-1,"updated":-1})
            .limit(limit)
            .skip(skip)
            .exec((err, issue)=>{
                if(err){
                    res.send({
                        success: false,
                        error: err
                    });
                }else {
                    res.send({
                        success: true,
                        list: issue,
                        pagination: {
                            total: count,
                            current: parseInt(currentPage)
                        }
                    });
                }
            });
    });
});

module.exports = router;