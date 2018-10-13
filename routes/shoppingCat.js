var express = require('express');
var router = express.Router();
let ShoppingCat=require('../models/shoppingCat');
let moment=require('moment');
let errorcodes=require('../constants/errorCodes');
let auth=require('../utils/auth');

//加入到购物车
router.post('/AddShoppingCat', function(req, res, next) {
    // if(!auth.isAuth(req))
    // {
    //     res.send({
    //         success: false,
    //         code: errorcodes.NO_LOGIN
    //     });
    // }    // else
    // {

        let shoppingcat = req.body;
        let isExistCat=false; //是否已存在某个用户的购物车
        ShoppingCat.findByCustomerId(shoppingcat.customerId,function(err, catList){
            if(err){
                res.send({
                    success: false,
                    error:err
                });
            }
            else if(catList.length>0)
            {
                isExistCat=true;
            }
    
            if(!isExistCat)  //不存在用户的购物车，新增
            {
                var newModel=new ShoppingCat(shoppingcat);
                newModel.save((err, shoppingcat)=>{
                    if(err){
                        res.send({
                            success: false,
                            error: err
                        });
                    }else {
                        res.send({
                            success: true,
                            shoppingcat: shoppingcat
                        });
                    }
                });
            }
            else  //如果存在用户的购物车,修改
            {
                catList[0].updated=moment().format();
                var index=catList[0].products.findIndex(
                    (n)=>{
                        return n.productId.toString()===shoppingcat.products.productId.toString();
                    }
                );
                if(index!==-1)  //购物车存在相同商品，则购买数+
                {
                    catList[0].products[index].buyCount+=shoppingcat.products.buyCount;
                }
                else  //购物车不存在相同商品，新增商品
                {
                    catList[0].products.push(shoppingcat.products);
                }
                //保存购物车修改
                catList[0].save((err, shoppingcat)=>{
                    if(err){
                        res.send({
                            success: false,
                            error: err
                        });
                    }else {
                        res.send({
                            success: true,
                            shoppingcat: shoppingcat
                        });
                    }
                });
            }
        });
    // }
});

//从购物车中删除商品
router.post('/DeleteShoppingCat', function(req, res, next) {
    if(!auth.isAuth(req))
    {
        res.send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let shoppingcat = req.body;
        ShoppingCat.findByCustomerId(shoppingcat.customerId,function(err, catList){
            if(err){
                res.send({
                    success: false,
                    error:err
                });
            }
            else if(catList.length<=0)  
            {
                res.send({
                    success: false,
                    code:errorcodes.SHOPPINGCAT_NOTEXIST
                });
            }
            else  //如果存在用户的购物车,修改
            {
                var index=catList[0].products.findIndex(
                    (n)=>{
                        return n.productId.toString()===shoppingcat.productId.toString();
                    }
                );
                if(index==-1)  //购物车中不存在指定的商品
                {
                    res.send({
                        success: false,
                        code:errorcodes.SHOPPINGCAT_PRODUCT_NOTEXIST
                    });
                }
                else  //购物车中存在商品，删除记录
                {
                    catList[0].products.splice(index,1);
                    catList[0].updated=moment().format();
                    //保存购物车修改
                    catList[0].save((err, shoppingcat)=>{
                        if(err){
                            res.send({
                                success: false,
                                error: err
                            });
                        }else {
                            res.send({
                                success: true,
                                shoppingcat: shoppingcat
                            });
                        }
                    });
                }
            }
        });
    }
});

//清空购物车
router.post('/ClearShoppingCat', function(req, res, next) {
    if(!auth.isAuth(req))
    {
        res.send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let shoppingcat = req.body;
        ShoppingCat.findByCustomerId(shoppingcat.customerId,function(err, catList){
            if(err){
                res.send({
                    success: false,
                    error:err
                });
            }
            else if(catList.length<=0)  
            {
                res.send({
                    success: false,
                    code:errorcodes.SHOPPINGCAT_NOTEXIST
                });
            }
            else  //如果存在用户的购物车,修改
            {
                var length=catList[0].products.length;
                catList[0].products.splice(0,length);  //清空购物车
                catList[0].updated=moment().format();
                //保存购物车修改
                catList[0].save((err, shoppingcat)=>{
                    if(err){
                        res.send({
                            success: false,
                            error: err
                        });
                    }else {
                        res.send({
                            success: true,
                            shoppingcat: shoppingcat
                        });
                    }
                });
            }
        });
    }
});

//修改购物车商品数量
router.post('/UpdateBuyCount', function(req, res, next) {
    if(!auth.isAuth(req))
    {
        res.send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let shoppingcat = req.body;
        ShoppingCat.findByCustomerId(shoppingcat.customerId,function(err, catList){
            if(err){
                res.send({
                    success: false,
                    error:err
                });
            }
            else if(catList.length<=0)  
            {
                res.send({
                    success: false,
                    code:errorcodes.SHOPPINGCAT_NOTEXIST
                });
            }
            else  //如果存在用户的购物车,修改
            {
                var index=catList[0].products.findIndex(
                    (n)=>{
                        return n.productId.toString()===shoppingcat.productId.toString();
                    }
                );
                if(index==-1)  //购物车中不存在指定的商品
                {
                    res.send({
                        success: false,
                        code:errorcodes.SHOPPINGCAT_PRODUCT_NOTEXIST
                    });
                }
                else  //购物车中存在商品，修改购买数量
                {
                    catList[0].products[index].buyCount=shoppingcat.buyCount;
                    catList[0].updated=moment().format();
                    //保存购物车修改
                    catList[0].save((err, shoppingcat)=>{
                        if(err){
                            res.send({
                                success: false,
                                error: err
                            });
                        }else {
                            res.send({
                                success: true,
                                shoppingcat: shoppingcat
                            });
                        }
                    });
                }
            }
        });
    }
});

//查询购物车
router.get('/QueryShoppingCat/:customerId', function(req, res, next) {
    let customerId=req.params.customerId;
    ShoppingCat.findByCustomerId(customerId,function(err, catList){
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
                shoppingCat: catList[0]
            });
        }
    });
});
module.exports = router;