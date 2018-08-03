var express = require('express');
var router = express.Router();
let ShoppingCat=require('../models/shoppingCat');
let moment=require('moment');
let constants=require('../constants/constants');
let errorcodes=require('../constants/errorCodes');

//生成订单
router.post('/CreateOrder', function(req, res, next) {
    let order = req.body;
    var newModel=new Product(order);
    newModel.save((err, order)=>{
        if(err){
            res.send({
                success: false,
                error: err
            });
        }else {
            res.send({
                success: true,
                order: order
            });
        }
    });
});

//修改订单(修改订单状态、取消订单、删除订单等)

//分页订单查询

module.exports=router;