let mongoose =  require('mongoose');
let Schema = mongoose.Schema;

let productSchema = new Schema({
    categoryId:Schema.Types.ObjectId, //分类ID
    name: String,  //商品名称
    descption:String, //商品详情
    price:Schema.Types.Decimal128, //价格
    images:[String],  //图片
    bookAttribute:{
        author:String, //作者
        publisher:String, //出版社
        publicationTime:Date, //出版时间
        ISBN:String
    },
    inventory:Number,  //库存
    salesCount:{ type: Number, default: 0} , //销量
    collectCount:{ type: Number, default: 0}, //收藏数
    commentCount:{ type: Number, default: 0} , //评论数
    isActive:{ type: Boolean, default: true},   //是否上架
    updated: { type: Date, default: Date.now}
});

/**
 *here can add same methods or statics
 */
productSchema.statics.findByProductIdId=function(productId, cb){
    return this.find({_id:productId}, cb);
};

module.exports = mongoose.model('Product', productSchema);