var express = require('express');
var router = express.Router();
let Order=require('../models/order');
let Sequence=require('../models/Sequence');
let moment=require('moment');
let constants=require('../constants/constants');
let utils=require('../utils/utils');
let auth=require('../utils/auth');
let errorcodes=require('../constants/errorCodes');

//得出订单编号的追加序号
function _getSequence(sequenceType)
{
    var getResult =Sequence.find({sequenceType:sequenceType}).exec()
    .then(    
        function(promiseResult) {

        // 新建序号
        if(promiseResult.length<=0)
        {
            var newModel=new Sequence({sequenceType:sequenceType,sequenceNum:1});
            return  newModel.save();
        }
        else //修改序号
        {
            promiseResult[0].sequenceNum+=1;
            return promiseResult[0].save();
        }
      }).error(function(error){
        return 'Promise Error:'+error;
    });
    return getResult;
}

//生成订单
router.post('/CreateOrder', function(req, res, next) {
    // if(!auth.isAuth(req))
    // {
    //     res.send({
    //         success: false,
    //         code: errorcodes.NO_LOGIN
    //     });
    // }
    // else
    // {
        let order = req.body;
        var sequenceType='Order_Sequence_'+moment().format('YYYYMMDD'); 
        var sequenceResult=_getSequence(sequenceType); //获取生成订单需要的序号
        sequenceResult.then(function(promiseData){
          order.orderNumber=utils.getOrderNumber(promiseData.sequenceNum.toString()); //订单编号
          var newModel=new Order(order);
          newModel.orderStatus.push({status:1});  //订单状态设置为已提交
          newModel.lastStatus=1;
          newModel.createdateStr=moment().format('YYYY-MM-DD');
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
        })
        .error(function(error){console.log(error)});
    // }
});

//修改订单状态
router.put('/UpdateOrder/:orderId', function(req, res, next) {
    let reqbody = req.body;
    if(!reqbody.isFront&&!auth.isAdminAuth(req))
    {
        res.send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let orderId = req.params.orderId;
        let status = reqbody.status;
        var update={$set:{"updated":moment().format(),"lastStatus":status}};
        if(status)
        {
            Object.assign(update,{$push:{"orderStatus":{"status":status}}}); //修改订单状态
        }
        Order.findOneAndUpdate({_id:orderId}, update, {new: true}, (err, order)=>{
            if(err){
                res.status(500).send({
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
    }
});

//删除订单
router.put('/DeleteOrder/:orderId', function(req, res, next) {
    if(!auth.isAuth(req))
    {
        res.send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        let orderId = req.params.orderId;
        var update={$set:{"updated":moment().format(),"isDelete":true}};
        Order.findOneAndUpdate({_id:orderId}, update, {new: true}, (err, order)=>{
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
    }
});

//分页订单查询
//param:queryType(查询类型 1.网站查询 2.后台查询)
router.get('/OrdersByPage', function(req, res, next) {
    let {currentPage,orderNumber,customerId,createdate_s,createdate_e,lastStatus,memo,payType,pageSize,isDelete,sorter,queryType=1}=req.query;
    if(queryType===2&&!auth.isAdminAuth(req))
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
        if(orderNumber){
            queryCondition['orderNumber'] = new RegExp(orderNumber);
        }
        if(customerId){
            queryCondition['customerId'] = customerId;
        }
        if(createdate_s&&createdate_e)
        {
            Object.assign(queryCondition,{"createdate":{$gte:createdate_s,$lte:createdate_e}});
        }
        if(payType){
            queryCondition['payType'] =payType;
        }
        if(lastStatus)
        {
            queryCondition['lastStatus'] =lastStatus;
        }
        if(memo){
            queryCondition['memo'] = new RegExp(memo);
        }
        if(isDelete)
        {
            queryCondition['isDelete'] = isDelete;
        }
        if(sorter)
        {
            let sortField=utils.getSortField(sorter);
            let sortType=utils.getSortType(sorter);
            switch(sortField)
            {
                case "orderNumber": //订单编号
                Object.assign(sortCondition,{"orderNumber":sortType});    
                break;
                case "createdate": //创建日期排序
                Object.assign(sortCondition,{"createdate":sortType});    
                break;
                case "updated": //更新时间排序
                Object.assign(sortCondition,{"updated":sortType});    
                break;
            }
        }
        else
        {
            Object.assign(sortCondition,{"orderNumber":-1}); // 默认按订单编号倒序    
        }
        Order.countDocuments(queryCondition, (err, count)=>{
            Order.find(queryCondition)
                .sort(sortCondition)
                .limit(limit)
                .skip(skip)
                .exec((err, orders)=>{
                    if(err){
                        res.status(500).send({
                            success: false,
                            error: err
                        });
                    }else {
                        res.send({
                            success: true,
                            list: orders,
                            pagination: {
                                total: count,
                                current:parseInt(currentPage) 
                            }
                        });
                    }
                });
        });
    }
});

//查询单个订单
router.get('/OrderQuery/:orderId', function(req, res, next) {
    let orderId = req.params.orderId;
    Order.findByOrderId(orderId,function(err, order){
        if(err){
            res.status(500).send({
                error:err
            });
        }
        else
        {
            res.send({
                success: true,
                order:order
            });
        }
    })
});

//订单总数统计(不包括已取消的)
router.get('/OrdersCount', function(req, res, next) {
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
        queryCondition['lastStatus'] !=-1;
        Order.countDocuments(queryCondition, (err, count)=>{
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

//最近7日订单数统计(不包括已取消的)
router.get('/OrdersGroupByCreateDate', function(req, res, next) {
    if(!auth.isAdminAuth(req))
    {
        res.status(401).send({
            success: false,
            code: errorcodes.NO_LOGIN
        });
    }
    else
    {
        // var startdate=moment().subtract(360, 'days').format('YYYY-MM-DD');
        Order.aggregate(
            [{$match : {lastStatus:{$ne:-1}}},
            {$group:{_id:"$createdateStr" ,y:{$sum:1}}},
            {$project:{x:"$_id",y:"$y"}},
            {$sort:{"_id":-1}},
            {$limit:7}]
        ).exec(function(err,result){
            if(err){
                res.status(500).send({
                    success: false,
                    error: err
                });
            }else {
                res.send({
                    success: true,
                    result: result, 
                });
            }
         });
    }
});

module.exports=router;