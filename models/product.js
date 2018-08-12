let mongoose =  require('mongoose');
let Schema = mongoose.Schema;

let productSchema = new Schema({
    categoryId: { type: Schema.Types.ObjectId, required: true}, //分类ID
    name: { type: String, required: true,trim:true },  //商品名称
    descption:{ type: String, required: true}, //商品详情
    price:{ type: Schema.Types.Decimal128, required: true}, //价格
    images:[String],  //图片
    bookAttribute:{
        author:{ type: String, required: true}, //作者
        publisher:{ type: String, required: true}, //出版社
        publicationTime:{ type: Date, required: true,index:true}, //出版时间
        ISBN:String
    },
    inventory:{ type: Number, required: true,min:0},  //库存
    salesCount:{ type: Number, default: 0,index:true,min:0} , //销量
    collectCount:{ type: Number, default: 0,min:0}, //收藏数
    commentCount:{ type: Number, default: 0,index:true,min:0} , //评论数
    isActive:{ type: Boolean, default: true},   //是否上架
    updated: { type: Date, default: Date.now}
});

/**
 *here can add same methods or statics
 */
productSchema.statics.findByProductId=function(productId, cb){
    return this.find({_id:productId}, cb);
};

module.exports = mongoose.model('Product', productSchema);