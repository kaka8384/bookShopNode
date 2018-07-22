let mongoose =  require('mongoose');
let Schema = mongoose.Schema;

let productSchema = new Schema({
    categoryId:Schema.Types.ObjectId, //分类ID
    name: String,  //商品名称
    descption:String,
    price:Decimal128,
    images:[String],
    bookAttribute:{
        author:String,
        publisher:String,
        publicationTime:Date,
        ISBN:String
    },
    inventory:Number,
    salesCount:Number,
    collectCount:Number,
    commentCount:Number,
    isActive:{ type: Boolean, default: true },   //是否上架
    updated: { type: Date, default: Date.now }
});

/**
 *here can add same methods or statics
 */
productSchema.statics.findByProductIdId=function(productId, cb){
    return this.find({_id:productId}, cb);
};

module.exports = mongoose.model('Product', productSchema);