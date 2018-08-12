var express = require('express');
var router = express.Router();
let Order=require('../models/order');
let Sequence=require('../models/Sequence');
let moment=require('moment');
let constants=require('../constants/constants');
let utils=require('../utils/utils');

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
    let order = req.body;
    var sequenceType='Order_Sequence_'+moment().format('YYYYMMDD'); 
    var sequenceResult=_getSequence(sequenceType); //获取生成订单需要的序号
    sequenceResult.then(function(promiseData){
      order.orderNumber=utils.getOrderNumber(promiseData.sequenceNum.toString()); //订单编号
      var newModel=new Order(order);
      newModel.orderStatus.push({status:1});  //订单状态设置为已提交
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

});

//修改订单状态
router.put('/UpdateOrder/:orderId', function(req, res, next) {
    let orderId = req.params.orderId;
    let status = req.body.status;
    var update={$set:{"updated":moment().format()}};
    if(status)
    {
        Object.assign(update,{$push:{"orderStatus":{"status":status}}}); //修改订单状态
    }
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
});

//删除订单
router.put('/DeleteOrder/:orderId', function(req, res, next) {
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
});

//分页订单查询
router.get('/OrdersByPage', function(req, res, next) {
    let {page,ordernum,cid,createdate_s,createdate_e,productname,status,rowCount,isDelete}=req.query;
    let limit = rowCount?rowCount:constants.PAGE_SIZE;
    let skip = (page - 1) * limit;
    let queryCondition = {}; 
    // let sortCondition = {};
    if(ordernum){
        queryCondition['orderNumber'] = new RegExp(ordernum);
    }
    if(cid){
        queryCondition['customerId'] = cid;
    }
    if(createdate_s)
    {
        Object.assign(queryCondition,{"createdate":{$gte:createdate_s}});
    }
    if(createdate_e)
    {
        Object.assign(queryCondition,{"createdate":{$lte:createdate_e}});
    }
    if(productname){
        queryCondition['products.name'] = new RegExp(productname);
    }
    if(status)
    {
        queryCondition['orderStatus.status'] =status;
    }
    if(isDelete)
    {
        queryCondition['isDelete'] = isDelete;
    }
    Order.countDocuments(queryCondition, (err, count)=>{
        Order.find(queryCondition)
            .sort({"orderNumber":-1})
            .limit(limit)
            .skip(skip)
            .exec((err, orders)=>{
                if(err){
                    res.send({
                        success: false,
                        error: err
                    });
                }else {
                    res.send({
                        success: true,
                        orders: orders,
                        page: {
                            total: count,
                            current: page
                        }
                    });
                }
            });
    });
});

module.exports=router;