var express = require('express');
var router = express.Router();
let Order=require('../models/Order');
let Sequence=require('../models/Sequence');
let moment=require('moment');
let constants=require('../constants/constants');
let errorcodes=require('../constants/errorCodes');
let cache=require('memory-cache');
let utils=require('../utils/utils');

//得出订单编号的追加序号
function _getSequence()
{
    var returnSequence="1";
    var sequenceType='Order_Sequence_'+moment().format('YYYYMMDD'); 
    var promise =Sequence.find({sequenceType:sequenceType}).exec();
    promise.then(    
        function(sequence) {
            console.log("ok");
        // on resolve
        if(sequence.length<=0)
        {
            var newModel=new Sequence({sequenceType:sequenceType,sequenceNum:1});
            newModel.save((err, sequence)=>{
                if(!err){
                    returnSequence=sequence.sequenceNum.toString();
                }
                return returnSequence;
            });
        }
        else
        {
            sequence.sequenceNum+=1;
            sequence.save((err, sequence)=>{
                if(!err){
                    returnSequence=sequence.sequenceNum.toString();
                }
                return returnSequence;
            });
        }
      },
      function(err) {
        console.log("err");
        // on reject
      });

    // var sequence=cache.get(cacheKey);
    // if(!!sequence)
    // {
    //     sequence=(parseInt(sequence)+1).toString();
    // }
    // else
    // {
    //     sequence="1";
    // }
    // cache.put(cacheKey,sequence,86400000);  //缓存每日订单序号，缓存1天 
    // return sequence;
}

//生成订单
router.post('/CreateOrder', function(req, res, next) {
    let order = req.body;
    var sequence=_getSequence();
    order.orderNumber=utils.getOrderNumber(sequence); //订单编号
    var newModel=new Order(order);
    // order.products.map((item,index)=>{
    //     console.log(item);
    //     newModel.products.push(item);
    // });
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
});

//修改订单(修改订单状态、取消订单、删除订单等)

//分页订单查询

module.exports=router;