var express = require('express');
var router = express.Router();
let Product_Issue=require('../models/product_issue');
let moment=require('moment');
let constants=require('../constants/constants');
let errorcodes=require('../constants/errorCodes');
let auth=require('../utils/auth');
let utils=require('../utils/utils');

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
            res.status(500).send({
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
                    res.status(500).send({
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
                res.status(500).send({
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
    let issue = req.body;
    if(issue.isAdmin&&!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else if(!issue.isAdmin&&!auth.isAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let currentUser = req.session.userInfo;
        let issueId = req.params.issueId;
    
        //  非管理员删除时判断该提问是否为自己提的
        if(!issue.isAdmin&&(!currentUser||currentUser._id!==issue.customerId))
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
                            issueId:issueId
                        });
                    })
                    .error(function(err){
                        res.status(500).send({
                            success: false,
                            error: err
                        });
                    });
                }
            })
        }
    }
});

//批量删除问题(管理员后台操作)
router.delete('/BatchDeleteProductIssue', function(req, res, next) {
    if(!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let issueIds = req.body.issueIds;
        Product_Issue.remove({_id: {$in:issueIds}}, (err)=>{
            if (err) {
                res.status(500).send({
                    success: false,
                    error: err
                });
            } else {
                res.send({
                    success: true,
                    issueIds:issueIds
                });
            }
        });
    }
});

//分页查询问题
//param:queryType(查询类型 1.网站查询 2.后台查询)
router.get('/Product_IssueByPage', function(req, res, next) {
    let {currentPage,productId,productName,customerId,issue,issueDate_s,issueDate_e,pageSize,sorter,queryType}=req.query;
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
        if(productId){
            queryCondition['productId'] = productId;
        }
        if(productName){
            queryCondition['productName'] = new RegExp(productName);
        }
        if(customerId){
            queryCondition['customerId'] = customerId;
        }
        if(issue){
            queryCondition['issue'] = new RegExp(issue);
        }

        if(issueDate_s&&issueDate_e)
        {
            Object.assign(queryCondition,{"issueDate":{$gte:issueDate_s,$lte:issueDate_e}});
        }
        if(sorter)
        {
            let sortField=utils.getSortField(sorter);
            let sortType=utils.getSortType(sorter);
            switch(sortField)
            {
                case "productName": //商品名称
                Object.assign(sortCondition,{"productName":sortType});    
                break;
                case "issueDate": //提问时间排序
                Object.assign(sortCondition,{"issueDate":sortType});    
                case "updated": //更新时间排序
                Object.assign(sortCondition,{"updated":sortType});    
                break;
            }
        }
        else
        {
            Object.assign(sortCondition,{"issueDate":-1,"updated":-1}); // 默认按提问时间、更新时间倒序    
        }
        Product_Issue.countDocuments(queryCondition, (err, count)=>{
            Product_Issue.find(queryCondition)
                .sort(sortCondition)
                .limit(limit)
                .skip(skip)
                .exec((err, issue)=>{
                    if(err){
                        res.status(500).send({
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
    }
   
});

module.exports = router;