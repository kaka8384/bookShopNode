var express = require('express');
var router = express.Router();
let Customer=require('../models/customer');
let moment=require('moment');
let md5=require("md5");
let constants=require('../constants/constants');
let errorcodes=require('../constants/errorCodes');
let utils=require('../utils/utils');

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
                    code: errorcodes.USERNAME_EXIST
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
            let authToken = utils.getAuthToken(10);
            let {_id, username} = customer;
            //注册成功将用户信息写入 session
            req.session.userInfo = {
                _id,
                username
            };
            res.send({
                success: true,
                userInfo:{
                    username: customer['username'],
                    authToken: authToken
                }
            });
        }
    });
});

//网站用户登录
router.post('/CustomerLogin',function (req, res, next) {
    let userInfo = req.body;
    Customer.findByUserName(userInfo['username'], function(err, userList){
        if(err){
            res.send({
                error:err
            });
        }
        if(userList.length==0){
            //用户不存在
            res.send({
                success: false,
                code: errorcodes.USERNAME_NOTEXIST 
            });
        }else {
            if(userList[0]['isActive']==false)
            {
                res.send({
                    success: false,
                    code: errorcodes.CUSTOMER_NOACTIVE
                });
            }
            else if(md5(userInfo['password'])===userList[0]['password']){
                let {_id, username} = userList[0];
                let authToken = utils.getAuthToken(10);
                //登录成功将用户信息写入 session
                req.session.userInfo = {
                    _id,
                    username
                };
                res.send({
                    success: true,
                    userInfo:{
                        username: userInfo['username'],
                        authToken:authToken,
                    }
                });
            }
            else {
                //密码错误
                res.send({
                    success: false,
                    code: errorcodes.PASSWORD_ERROR
                });
            }
        }
    });
});

//网站用户退出
router.post('/CustomerLogout',function (req, res, next) {
	let currentUser = req.session.userInfo;
	// console.log('logout'+JSON.stringify(currentUser));
	if(currentUser && currentUser._id){
		//销毁session
		req.session.destroy(function(err) {
			res.send({
				success: true,
				userInfo:{
					username: currentUser['username']
				}
			});
		});
	}else {
		res.send({
			isAuth: false
		})
	}
});

//网站用户信息修改
router.put('/UpdateCustomer/:customerId', function(req, res, next) {
    let customerId = req.params.customerId;
    let customer = req.body;
    if(customer.password)
    {
        customer.password=md5(customer.password);  //修改密码
    }
    customer.updated=moment().format();
    let newCustomer = Object.assign({}, customer);
    Customer.findOneAndUpdate({_id:customerId}, newCustomer, {new: true}, (err, customer)=>{
        if(err){
            res.send({
                success: false,
                error: err
            });
        }
        else if(customer==null)
        {
            res.send({
                success: false,
                code: errorcodes.USERNAME_NOTEXIST 
            });
        }
        else {
            res.send({
                success: true,
                customer: customer
            });
        }
    });
});


//网站用户注销(禁用)
router.put('/CancelCustomer/:customerId', function(req, res, next) {
    let customerId = req.params.customerId;
    let customer = req.body;
    customer.updated=moment().format();
    customer.isActive=false; //禁用用户
    let newCustomer = Object.assign({}, customer);
    Customer.findOneAndUpdate({_id:customerId}, newCustomer, {new: true}, (err, customer)=>{
        if(err){
            res.send({
                success: false,
                error: err
            });
        }
        else if(customer==null)
        {
            res.send({
                success: false,
                code: errorcodes.USERNAME_NOTEXIST 
            });
        }
        else {
            res.send({
                success: true,
                customer: customer
            });
        }
    });
});

//网站用户分页查询
router.get('/CustomerByPage', function(req, res, next) {
    let {page,username,mobile,nickname,gender,brithDayStart,brithDayEnd,rowCount,isActive}=req.query;
    let limit = rowCount?rowCount:constants.PAGE_SIZE;
    let skip = (page - 1) * limit;
    let queryCondition = {}; 
    // let sortCondition = {};
    if(username){
        queryCondition['username'] = new RegExp(username);
    }
    if(mobile){
        queryCondition['mobile'] = new RegExp(mobile);
    }
    if(nickname){
        queryCondition['nickname'] = new RegExp(nickname);
    }
    if(gender){
        queryCondition['gender'] = gender;
    }
    if(brithDayStart)
    {
        Object.assign(queryCondition,{"brithDay":{$gt:brithDayStart}});
    }
    if(brithDayEnd)
    {
        Object.assign(queryCondition,{"brithDay":{$lt:brithDayEnd}});
    }
    if(isActive)
    {
        queryCondition['isActive'] = isActive;
    }
    Customer.countDocuments(queryCondition, (err, count)=>{
        Customer.find(queryCondition)
            // .sort(sortCondition)
            .limit(limit)
            .skip(skip)
            .exec((err, customers)=>{
                if(err){
                    res.send({
                        success: false,
                        error: err
                    });
                }else {
                    res.send({
                        success: true,
                        customers: customers,
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