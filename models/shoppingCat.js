let mongoose =  require('mongoose');
let Schema = mongoose.Schema;

//购物车中商品
var productSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, required: true}, //商品ID
    name:{ type: String, required: true,trim:true }, //商品名称，
    img:String, //商品图片
    price:{ type: Schema.Types.Decimal128, required: true}, //商品价格
    buyCount:{ type: Number, default: 1,min:1}, //购买数
    isSelect:{ type: Boolean, default: true}  //是否选择
}, {_id: false});


//购物车
let shoppingCatSchema = new Schema({
    customerId: { type: Schema.Types.ObjectId, required: true,index:true,unique:true}, //客户ID
    products:[productSchema],
    updated: { type: Date, default: Date.now }
});

/**
 *here can add same methods or statics
 */
shoppingCatSchema.statics.findByCustomerId=function(customerId, cb){
    return this.find({customerId:customerId}, cb);
};

module.exports = mongoose.model('ShoppingCat', shoppingCatSchema);