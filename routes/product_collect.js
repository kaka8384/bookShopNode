var express = require('express');
var router = express.Router();
let Product_Collect=require('../models/product_collect');
let Product=require('../models/product');
let moment=require('moment');
let constants=require('../constants/constants');
let errorcodes=require('../constants/errorCodes');
let auth=require('../utils/auth');
let utils=require('../utils/utils');

//添加收藏
router.post('/AddProductCollect', function(req, res, next) {
        let collect = req.body;
        Product_Collect.find({"customerId":collect.customerId,"product.productId":collect.product.productId})
        .exec().then(function(obj){
            if(obj.length>0) //商品已收藏
            {
                res.send({
                    success: false,
                    code:errorcodes.PRODUCT_COLLECTION_EXIST
                });
            }
            else
            {
                var newModel=new Product_Collect(collect);
                newModel.save().then(function(collect){
                    _updateProductCollectCount(collect.product.productId,1);
                    res.send({
                        success: true,
                        collect: collect
                    });
             
                }).error(function(err){
                    res.status(500).send({
                        success: false,
                        error: err
                    });
                });
            }
        })

    // }
});

//删除收藏
router.delete('/DeleteProductCollect/:collectId', function(req, res, next) {
    // if(!auth.isAuth(req))
    // {
    //     res.send({
    //         success: false,
    //         code: errorcodes.NO_LOGIN
    //     });
    // }
    // else
    // {
        // let currentUser = req.session.userInfo;
        let collectId = req.params.collectId;
        // let collect = req.body;
        //  非管理员删除时判断该提问是否为自己提的
        // if(!currentUser||currentUser._id!==collect.customerId)
        // {
        //     res.send({
        //         success: false,
        //         code:errorcodes.NO_DATA_PERMISSION
        //     });
        // }
        // else
        // {
            Product_Collect.findByCollectId(collectId).exec().then(function(collect){
                if(collect.length<=0) //收藏不存在
                {
                    res.send({
                        success: false,
                        code:errorcodes.COLLECTION_NOTEXIST
                    });
                }
                else
                {
                    Product_Collect.remove({_id: collect[0]._id}).then(function(){
                        _updateProductCollectCount(collect[0].product.productId,-1);  //减少收藏数
                        res.send({
                            success: true,
                            collectId:collectId
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
        // }
    // }
});

//批量删除收藏
//后期完善加上判断所删除的收藏是否为本人的
router.delete('/BatchDeleteProductCollect', function(req, res, next) {
    if(!auth.Auth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let collectIds = req.body.collectIds;
        Product_Collect.remove({_id: {$in:collectIds}}, (err)=>{
            if (err) {
                res.status(500).send({
                    success: false,
                    error: err
                });
            } else {
                res.send({
                    success: true,
                    collectIds:collectIds
                });
            }
        });
    }
});

//分页查询我的收藏
router.get('/Product_CollectByPage', function(req, res, next) {
    let {currentPage,productName,customerId,pageSize,sorter}=req.query;
    // if(auth.isAuth(req))
    // {
    //     res.status(401).send({
    //         success: false,
    //         code: errorcodes.NO_LOGIN
    //     });
    // }
    // else
    // {
        let limit = pageSize?parseInt(pageSize):constants.PAGE_SIZE;
        let skip = (currentPage - 1) * limit;
        let queryCondition = {}; 
        let sortCondition = {};
        if(productName){
            queryCondition['productName'] = new RegExp(productName);
        }
        if(customerId){
            queryCondition['customerId'] = customerId;
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
                case "updated": //更新时间排序
                Object.assign(sortCondition,{"updated":sortType});    
                break;
            }
        }
        else
        {
            Object.assign(sortCondition,{"updated":-1}); // 默认按更新时间倒序    
        }
        Product_Collect.countDocuments(queryCondition, (err, count)=>{
            Product_Collect.find(queryCondition)
                .sort(sortCondition)
                .limit(limit)
                .skip(skip)
                .exec((err, collets)=>{
                    if(err){
                        res.status(500).send({
                            success: false,
                            error: err
                        });
                    }else {
                        res.send({
                            success: true,
                            list: collets,
                            pagination: {
                                total: count,
                                current: parseInt(currentPage)
                            }
                        });
                    }
                });
        });
    // }
   
});

//修改商品的收藏次数
function _updateProductCollectCount(productId,incCount)
{
    var update={$set:{"updated":moment().format()},$inc:{"collectCount":incCount}};
    var queryCondition={_id:productId,collectCount:{$gte:0}};
    if(incCount<0)
    {
        queryCondition={_id:productId,collectCount:{$gt:0}};
    }
    Product.findOneAndUpdate(queryCondition, update, {new: true}, (err, product)=>{
    });
}

module.exports = router;