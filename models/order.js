let mongoose =  require('mongoose');
let Schema = mongoose.Schema;

let orderSchema = new Schema({
    orderNumber: { type: String, required: true,unique:true,index:true}, //订单编号
    createdate: { type: Date, default: Date.now,index:true}, //创建日期
    orderPrice:{ type: Schema.Types.Decimal128, required: true}, //订单金额
    payType:{type:Number,required: true,enum:[1,2]}, //支付方式 1.在线支付 2.货到付款
    orderStatus:[{
        status:{type:Number,required: true,enum:[-1,1,2,3,4]}, //状态 -1. 已取消 1.已提交 2.已付款 3.已出库 4.已完成
        date:{ type: Date, default: Date.now} //操作时间
    }],   //订单状态
    consignee:{ type: String, required: true,trim:true }, //收货人
    updated: { type: Date, default: Date.now}
});

/**
 *here can add same methods or statics
 */
orderSchema.statics.findByOrderId=function(orderId, cb){
    return this.find({_id:orderId}, cb);
};

module.exports = mongoose.model('Order', orderSchema);