var express = require('express');
var router = express.Router();
let Product_Comment=require('../models/product_comment');
let Order=require('../models/order');
let Product=require('../models/product');
let moment=require('moment');
let constants=require('../constants/constants');
let errorcodes=require('../constants/errorCodes');
let auth=require('../utils/auth');

//新建评论
router.post('/AddProductComment', function(req, res, next) {
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
        let comment = req.body;
        if(!currentUser||currentUser._id!==comment.customerId)
        {
            res.send({
                success: false,
                code:errorcodes.NO_DATA_PERMISSION
            });
        }
        else
        {
            var newModel=new Product_Comment(comment);
            newModel.save().then(function(comment){
                _updateOrderCommentCount(comment.productId,1);
                _updateOrderCommentStatus(comment,true);
                res.send({
                    success: true,
                    comment: comment
                });
         
            }).error(function(err){
                res.send({
                    success: false,
                    error: err
                });
            });
        }
    }
});

//修改评论
router.put('/UpdateProductComment/:commentId', function(req, res, next) {
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
        let commentId = req.params.commentId;
        let comment = req.body;
        if(!currentUser||currentUser._id!==comment.customerId)
        {
            res.send({
                success: false,
                code:errorcodes.NO_DATA_PERMISSION
            });
        }
        else
        {
            comment.updated=moment().format();
            let newModel= Object.assign({}, comment);
            Product_Comment.findOneAndUpdate({_id:commentId}, newModel, {new: true}, (err, comment)=>{
                if(err){
                    res.send({
                        success: false,
                        error: err
                    });
                }else {
                    res.send({
                        success: true,
                        comment: comment
                    });
                }
            });
        }
    }
});

//删除评论
router.delete('/DeleteProductComment/:commentId', function(req, res, next) {
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
        let commentId = req.params.commentId;
        let comment = req.body;
        if(!currentUser||currentUser._id!==comment.customerId)
        {
            res.send({
                success: false,
                code:errorcodes.NO_DATA_PERMISSION
            });
        }
        else
        {
            Product_Comment.findByCommentId(commentId).exec().then(function(comment){
                if(comment.length<=0) //评论不存在
                {
                    res.send({
                        success: false,
                        code:errorcodes.COMMENT_NOTEXIST
                    });
                }
                else
                {
                    Product_Comment.remove({_id: comment[0]._id}).then(function(){
                        _updateOrderCommentCount(comment[0].productId,-1);  //减少评论数
                        _updateOrderCommentStatus(comment[0],false); //修改评论状态
                        res.send({
                            success: true,
                            comment: comment[0]
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

//点赞或踩评论
router.put('/LikeComment/:commentId', function(req, res, next) {
    if(!auth.isAuth(req))
    {
        res.send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let commentId = req.params.commentId;
        let operation = req.body.operation;
        let currentUser = req.session.userInfo;
        var update={$set:{"updated":moment().format()}};
        var query={_id:commentId};
        if(operation==1)  //赞
        {
            Object.assign(update,  {$push:{"likeCustomers":currentUser._id}});
            Object.assign(query, {likeCustomers:{"$nin":[currentUser._id]}});  //查找登录客户没有赞过的
        }
        if(operation==2)  //踩
        {
            Object.assign(update,  {$push:{"notlikeCustomers":currentUser._id}});
            Object.assign(query, {notlikeCustomers:{"$nin":[currentUser._id]}});//查找登录客户没有踩过的
        }
        Product_Comment.findOneAndUpdate(query, update, {new: true}, (err, comment)=>{
            if(err){
                res.send({
                    success: false,
                    error: err
                });
            }else {
                res.send({
                    success: true,
                    comment: comment
                });
            }
        });
    }
});

//评论分页查询
router.get('/Product_CommentByPage', function(req, res, next) {
    let {currentPage,productId,customerId,commentCotent,commentStar,pageSize}=req.query;
    let limit = pageSize?parseInt(pageSize):constants.PAGE_SIZE;
    let skip = (currentPage - 1) * limit;
    let queryCondition = {}; 
    if(productId){
        queryCondition['productId'] = productId;
    }
    if(customerId){
        queryCondition['customerId'] = customerId;
    }
    if(commentCotent){
        queryCondition['commentCotent'] = new RegExp(commentCotent);
    }
    if(commentStar){
        queryCondition['commentStar'] = commentStar;
    }
    Product_Comment.countDocuments(queryCondition, (err, count)=>{
        Product_Comment.find(queryCondition)
            .sort({"updated":-1})
            .limit(limit)
            .skip(skip)
            .exec((err, comment)=>{
                if(err){
                    res.send({
                        success: false,
                        error: err
                    });
                }else {
                    res.send({
                        success: true,
                        list: comment,
                        pagination: {
                            total: count,
                            current: parseInt(currentPage)
                        }
                    });
                }
            });
    });
});

//修改商品的评价次数
function _updateOrderCommentCount(productId,incCount)
{
    var update={$set:{"updated":moment().format()},$inc:{"commentCount":incCount}};
    Product.findOneAndUpdate({_id:productId,commentCount:{$gte:0}}, update, {new: true}, (err, product)=>{
    });
}

//修改订单商品的评价状态
function _updateOrderCommentStatus(comment,isEvaluate)
{
    var update={$set:{"updated":moment().format(),"products.$.isEvaluate":isEvaluate}};
    Order.findOneAndUpdate({_id:comment.orderId,"products.productId":comment.productId}, update, {new: true}, (err, order)=>{
    });
}

module.exports = router;