let mongoose =  require('mongoose');
let Schema = mongoose.Schema;

var productSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, required: true}, //商品ID
    name:{ type: String, required: true,trim:true }, //商品名称，
    img:String, //商品图片
    price:{ type: Schema.Types.Decimal128, required: true}, //商品价格
    collectCount:{ type: Number, default: 0,min:0}, //收藏数
    commentCount:{ type: Number, default: 0,index:true,min:0} , //评论数
}, {_id: false});

//商品收藏
let collectSchema = new Schema({
    customerId: { type: Schema.Types.ObjectId, required: true}, //客户ID
    products:[productSchema],
    updated: { type: Date, default: Date.now}
});

/**
 *here can add same methods or statics
 */
collectSchema.statics.findByCollectId=function(collectId, cb){
    return this.find({_id:collectId}, cb);
};

module.exports = mongoose.model('Collect', collectSchema);