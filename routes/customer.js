var express = require('express');
var router = express.Router();
let Customer=require('../models/customer');
let moment=require('moment');
let md5=require("md5");
let constants=require('../constants/constants');

//网站用户注册
router.post('/CustomerRegister', function(req, res, next) {
    let customer = req.body;
    customer.password=md5(customer.password); //密码加密
    var newModel=new Customer(customer);
    newModel.save((err, customer)=>{
        if(err){
            if(err.code==11000)
            {
                res.send({
                    success: false,
                    code: 10001
                });  //用户名重复
            }  
            else
            {
                res.send({
                    success: false,
                    error: err
                });
            }
        }else {
            let {_id, username} = user;
            //注册成功将用户信息写入 session
            req.session.userInfo = {
                _id,
                username
            };
            res.send({
                success: true,
                customer: customer
            });
        }
    });
});

//网站用户登录

//网站用户修改

//网站用户分页查询

module.exports = router;