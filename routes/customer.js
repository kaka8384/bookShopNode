var express = require('express');
var router = express.Router();
let Customer=require('../models/customer');
let moment=require('moment');
let md5=require("md5");
let constants=require('../constants/constants');
let errorcodes=require('../constants/errorCodes');
let utils=require('../utils/utils');
let auth=require('../utils/auth');

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
                    userId:_id,
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
                        userId:_id,
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
	if(currentUser && currentUser._id){
        delete req.session.userInfo;
	}else {
		res.send({
			isAuth: false
		})
	}
});

//网站用户信息修改
router.put('/UpdateCustomer/:customerId', function(req, res, next) {
    if(!auth.isAuth(req))
    {
        res.send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
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
    }
});

//查询当前登录网站用户
router.get('/CurrentCustomer/:customerId', function(req, res, next) {
    // if(!auth.isAuth(req))  //如果没有登录信息
    // {
    //     res.status(401).send({
    //         success: false,
    //         code: errorcodes.NO_LOGIN
    //     });
    // }
    // else
    // {
        let userId = req.params.customerId;
        Customer.findByCustomerId(userId, function(err, userList){
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
                else {
                    let user=userList[0];
                    res.send({
                        success: true,
                        username: user.username,
                        userid:user._id,
                        mobile:user.mobile,
                        nickname:user.nickname,
                        gender:user.gender,
                        headImg:user.headImg 
                    });
                }
            }
        });
    // }
  });

//查询网站用户是否登录
// router.get('/IsLogin', function(req, res, next) {
//     return auth.isAuth(req);
// });


//网站用户注销(禁用)
router.put('/CancelCustomer/:customerId', function(req, res, next) {
    toggleCustomerStatus(req, res,1);
});

//网站用户启用
router.put('/OpenCustomer/:customerId', function(req, res, next) {
    toggleCustomerStatus(req, res,2);
});

//网站用户批量注销
router.put('/BatchCancelCustomer', function(req, res, next) {
    batchToggleCustomerStatus(req, res,1);
});

//网站用户批量启用
router.put('/BatchOpenCustomer', function(req, res, next) {
    batchToggleCustomerStatus(req, res,2);
});

//网站用户分页查询
router.get('/CustomerByPage', function(req, res, next) {
    let {currentPage,username,mobile,nickname,gender,brithDayStart,brithDayEnd,pageSize,isActive,sorter}=req.query;
    if(!auth.isAdminAuth(req))
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
        if(brithDayStart&&brithDayEnd)
        {
            Object.assign(queryCondition,{"brithDay":{$gte:brithDayStart,$lte:brithDayEnd}});
        }
        if(isActive)
        {
            queryCondition['isActive'] = isActive;
        }
        if(sorter)
        {
            let sortField=utils.getSortField(sorter);
            let sortType=utils.getSortType(sorter);
            switch(sortField)
            {
                case "username": //用户名
                Object.assign(sortCondition,{"username":sortType});    
                break;
                case "nickname": //客户昵称
                Object.assign(sortCondition,{"nickname":sortType});    
                break;
                case "gender": //性别
                Object.assign(sortCondition,{"gender":sortType});    
                break;
                case "brithDay": //生日
                Object.assign(sortCondition,{"brithDay":sortType});    
                break;
                case "updated": //更新时间排序
                Object.assign(sortCondition,{"updated":sortType});    
                break;
            }
        }
        else
        {
            Object.assign(sortCondition,{"updated":-1}); // 默认按更新时间倒序    
        }
        Customer.countDocuments(queryCondition, (err, count)=>{
            Customer.find(queryCondition)
                .sort(sortCondition)
                .limit(limit)
                .skip(skip)
                .exec((err, customers)=>{
                    if(err){
                        res.status(500).send({
                            success: false,
                            error: err
                        });
                    }else {
                        res.send({
                            success: true,
                            list: customers,
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

//网站用户总数统计(可用的)
router.get('/CustomerCount', function(req, res, next) {
    if(!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let queryCondition = {}; 
        queryCondition['isActive'] =true;
        Customer.countDocuments(queryCondition, (err, count)=>{
            if(err){
                res.status(500).send({
                    success: false,
                    error: err
                });
            }else {
                res.send({
                    success: true,
                    count: count, 
                });
            }
        })
    }
});

module.exports = router;

function batchToggleCustomerStatus(req, res,type) {
    if (!auth.isAdminAuth(req)) {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else {
        let customerIds = req.body.customerIds;
        Customer.update({ _id: { $in: customerIds } }, { "isActive": type===1?false:true }, { multi: true }, (err) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    error: err
                });
            }
            else {
                res.send({
                    success: true,
                    customerIds: customerIds
                });
            }
        });
    }
}

//切换客户是启用还是禁用
function toggleCustomerStatus(req, res,type) {
    if (!auth.isAdminAuth(req)) {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else {
        let customerId = req.params.customerId;
        let customer = req.body;
        customer.updated = moment().format();
        customer.isActive =type==1?false:true; //   1.禁用用户 2.启用用户
        let newCustomer = Object.assign({}, customer);
        Customer.findOneAndUpdate({ _id: customerId }, newCustomer, { new: true }, (err, customer) => {
            if (err) {
                res.send({
                    success: false,
                    error: err
                });
            }
            else if (customer == null) {
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
    }
}
