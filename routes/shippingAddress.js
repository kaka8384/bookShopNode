var express = require('express');
var router = express.Router();
let ShippingAddress=require('../models/shippingAddress');
let moment=require('moment');
// let constants=require('../constants/constants');
let auth=require('../utils/auth');
// let utils=require('../utils/utils');
let errorcodes=require('../constants/errorCodes');

//添加地址
router.post('/AddAddress', function(req, res, next) {
    if(!auth.isAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let currentUser = req.session.userInfo; //当前登录用户信息
        let address = req.body;
        var newModel=new ShippingAddress(address);
        newModel.customerId=currentUser._id; //赋值当前用户
        newModel.save((err, address)=>{
            if(err){
                res.send({
                    success: false,
                    error: err
                });
            }else {
                res.send({
                    success: true,
                    address: address
                });
            }
        });
    }
});

//修改地址
router.put('/UpdateAddress/:addressId', function(req, res, next) {
    if(!auth.isAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let currentUser = req.session.userInfo;
        let addressId = req.params.addressId;
        let address = req.body;
        if(!currentUser||currentUser._id!==address.customerId)
        {
            res.status(403).send({
                success: false,
                code:errorcodes.NO_DATA_PERMISSION
            });
        }
        else
        {
            address.updated=moment().format();
            let newModel= Object.assign({}, address);
            ShippingAddress.findOneAndUpdate({_id:addressId}, newModel, {new: true}, (err, address)=>{
                if(err){
                    res.send({
                        success: false,
                        error: err
                    });
                }else {
                    res.send({
                        success: true,
                        address: address
                    });
                }
            });
        }
    }
});

//删除地址
router.delete('/DeleteAddress/:addressId', function(req, res, next) {
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
        let addressId = req.params.addressId;
        let address = req.body;
        if(!currentUser||currentUser._id!==address.customerId)
        {
            res.send({
                success: false,
                code:errorcodes.NO_DATA_PERMISSION
            });
        }
        else
        {
            ShippingAddress.findByShippingAddressId(addressId).exec().then(function(address){
                if(address.length<=0) //地址不存在
                {
                    res.send({
                        success: false,
                        code:errorcodes.COMMENT_NOTEXIST
                    });
                }
                else
                {
                    ShippingAddress.remove({_id: address[0]._id}).then(function(){
                        res.send({
                            success: true,
                            address: address[0]
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

//设置默认地址
router.put('/SetDefaultAddress/:addressId', function(req, res, next) {
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
        let addressId = req.params.addressId;
        var update1={$set:{"updated":moment().format(),"isDefault":true}};
        var update2={$set:{"updated":moment().format(),"isDefault":false}};
        var query1={_id:addressId,customerId:currentUser._id};
        var query2={_id:{$ne :addressId},customerId:currentUser._id};
        //先把选择的设成默认地址
        ShippingAddress.findOneAndUpdate(query1, update1, {new: true}, (err, def)=>{
            if(err){
                res.send({
                    success: false,
                    error: err
                });
            }else {
                //把其它地址设成非默认地址
                ShippingAddress.findOneAndUpdate(query2,update2,{new:true},(err, nodefs)=>{
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
                            address: def
                        });
                    }
                });       
            }
        });
    }
});

//查询我的地址
router.get('/QueryAddress/:customerId', function(req, res, next) {
    // if(!auth.isAuth(req))
    // {
    //     res.send({
    //         success: false,
    //         code: errorcodes.NO_LOGIN
    //     });
    // }
    // else
    // {
        let customerId = req.params.customerId;
        ShippingAddress.findByCustomerId(customerId,function(err, addressList){
            if(err){
                res.send({
                    success: false,
                    error:err
                });
            }
            else  
            {
                res.send({
                    success: true,
                    addressList: addressList
                });
            }
        });
    // }
});
module.exports = router;