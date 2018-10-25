var express = require('express');
var router = express.Router();
let ShippingAddress=require('../models/shippingAddress');
let moment=require('moment');
// let constants=require('../constants/constants');
let auth=require('../utils/auth');
// let utils=require('../utils/utils');
let errorcodes=require('../constants/errorCodes');
let cityData=require('../constants/cityData');

//添加地址
router.post('/AddAddress', function(req, res, next) {
        // let currentUser = req.session.userInfo; //当前登录用户信息
        let address = req.body;
        var newModel=new ShippingAddress(address);
        // newModel.customerId=currentUser._id; //赋值当前用户
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
});

//修改地址
router.put('/UpdateAddress/:addressId', function(req, res, next) {
        // let currentUser = req.session.userInfo;
        let addressId = req.params.addressId;
        let address = req.body;
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
        // }
});

//删除地址
router.delete('/DeleteAddress/:addressId', function(req, res, next) {

        let addressId = req.params.addressId;
        // let address = req.body;
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
        // }
});

//设置默认地址
router.put('/SetDefaultAddress/:addressId', function(req, res, next) {
        let customerId = req.body.customerId;
        let addressId = req.params.addressId;
        var update1={$set:{"updated":moment().format(),"isDefault":true}};
        var update2={$set:{"updated":moment().format(),"isDefault":false}};
        var query1={_id:addressId,customerId:customerId};
        var query2={_id:{$ne:addressId},customerId:customerId};
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
    // }
});

//查询我的地址
router.get('/QueryAddress/:customerId', function(req, res, next) {
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
});

//查询省份
router.get('/QueryProvince/', function(req, res, next) {
    var province=cityData.cityJson.filter(function(item){
        return item.item_code.substr(2,4)=="0000";
    });
    if(!!province)
    {
        res.send({
            success: true,
            list: province
        });
    }
});

//查询市
router.get('/QueryCity/:province', function(req, res, next) {
    var province=req.params.province;
    var provinceStart= province.substr(0,2);
    var city=cityData.cityJson.filter(function(item){
        return item.item_code!=province
        &&item.item_code.substr(0,2)==provinceStart
        &&item.item_code.substr(4,2)=="00";
    });
    if(!!city)
    {
        res.send({
            success: true,
            list: city
        });
    }
});

//查询区
router.get('/QueryDistrict/:city', function(req, res, next) {
    var city=req.params.city;
    var cityStart= province.substr(0,4);
    var district=cityData.cityJson.filter(function(item){
        return item.item_code!=district
        &&item.item_code.substr(0,4)==cityStart;
    });
    if(!!district)
    {
        res.send({
            success: true,
            list: district
        });
    }
});

module.exports = router;