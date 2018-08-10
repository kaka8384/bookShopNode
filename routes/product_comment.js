var express = require('express');
var router = express.Router();
let Product_Comment=require('../models/product_comment');
let Order=require('../models/order');
let moment=require('moment');
let constants=require('../constants/constants');

//新建评论
router.post('/AddProductComment', function(req, res, next) {
    let comment = req.body;
    var newModel=new Product_Comment(comment);
    newModel.save().then(function(comment){
        var update={$set:{"updated":moment().format(),"products.$.isEvaluate":true}};
        Order.findOneAndUpdate({_id:comment.orderId,"products.productId":comment.productId}, update, {new: true}, (err)=>{
            if(err){
                res.send({
                    success: false,
                    error: err
                });
            }
            else
            {
                res.send({
                    success: true,
                    comment: comment
                });
            }
        });
 
    }).error(function(err){
        res.send({
            success: false,
            error: err
        });
    });
});

//修改评论
router.put('/UpdateProductComment/:commentId', function(req, res, next) {
    let commentId = req.params.commentId;
    let comment = req.body;
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
});

//删除评论
router.delete('/DeleteProductComment/:commentId', function(req, res, next) {
    let commentId = req.params.commentId;
    Product_Comment.remove({_id: commentId}, (err)=>{
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

//点赞或踩评论
router.put('/LikeProductComment/:commentId', function(req, res, next) {
    let commentId = req.params.commentId;
    let operation = req.body.operation;
    if(operation==1)  //点赞
    {
        comment.likenum+=1; 
    }
    if(operation==2)  //踩
    {
        comment.notlikenum+=1; 
    }
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
});

//评论分页查询

module.exports = router;