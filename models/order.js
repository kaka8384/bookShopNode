let mongoose =  require('mongoose');
let Schema = mongoose.Schema;

var productSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, required: true}, //商品ID
    name:{ type: String, required: true,trim:true }, //商品名称，
    img:String, //商品图片
    price:{ type: Schema.Types.Decimal128, required: true}, //商品价格
    buyCount:{ type: Number, default: 1,min:1}, //购买数
    isEvaluate:{ type: Boolean, default: false}, //是否已评价
}, {_id: false});

var statusSchema = new Schema({
    status:{type:Number,required: true,enum:[-1,1,2,3,4]}, //状态 -1. 已取消 1.已提交 2.已付款 3.已出库 4.已完成
    date:{ type: Date, default: Date.now} //操作时间
}, {_id: false});

var addressSchema = new Schema({
    // shippingAddressId: { type: Schema.Types.ObjectId, required: true}, //收货地址ID
    name:{ type: String, required: true,trim:true }, //收货人姓名
    province:{ type: String, required: true}, //省
    city:{ type: String, required: true},     //市
    district:{ type: String, required: true}, //区
    address:{ type: String, required: true},  //详细地址
    mobile:{ type: String, required: true ,maxlength:11}, //手机
}, {_id: false});

let orderSchema = new Schema({
    orderNumber: { type: String, required: true,unique:true,index:true}, //订单编号
    customerId: { type: Schema.Types.ObjectId, required: true,index:true}, //客户ID
    customerAccount:{ type: String,required: true},//客户帐号
    createdate: { type: Date, default: Date.now,index:true}, //创建日期
    createdateStr: { type: String, required:true}, //创建年月日
    products:[productSchema],
    orderPrice:{ type: Schema.Types.Decimal128, required: true}, //订单总金额
    freight:{ type: Schema.Types.Decimal128, default:0}, //运费
    payType:{type:Number,required: true,enum:[1,2]}, //支付方式 1.在线支付 2.货到付款
    orderStatus:[statusSchema],   //订单状态
    lastStatus:{type:Number,required: true,enum:[-1,1,2,3,4]}, //最新订单状态
    // consignee:{ type: String, required: true,trim:true }, //收货人,
    shippingAddress: { type: addressSchema, required: true}, //收货地址
    memo:{ type: String, trim:true }, //备注,
    isDelete: { type: Boolean, default: false}, //是否删除（用户管理中不显示)
    updated: { type: Date, default: Date.now}
});

/**
 *here can add same methods or statics
 */
orderSchema.statics.findByOrderId=function(orderId, cb){
    return this.find({_id:orderId}, cb);
};

module.exports = mongoose.model('Order', orderSchema);