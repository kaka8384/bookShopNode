let mongoose =  require('mongoose');
let Schema = mongoose.Schema;


//商品评论
let commentSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, required: true}, //商品ID
    productName: {  type: String, required: true,trim:true }, //商品名称
    customerId: { type: Schema.Types.ObjectId, required: true}, //客户ID
    customerName:{ type: String, trim:true },//客户昵称
    customerHeadImg:{ type: String },//客户头像
    orderId: { type: Schema.Types.ObjectId, required: true}, //订单ID
    orderNumber: { type: String, required: true}, //订单编号
    commentCotent: { type: String, required: true,maxlength:200}, //评论内容
    commentStar: { type: Number, required: true}, //评论星级
    likeCustomers:[Schema.Types.ObjectId], //点赞客户
    notlikeCustomers:[Schema.Types.ObjectId], //不认可客户
    updated: { type: Date, default: Date.now}
});

/**
 *here can add same methods or statics
 */
commentSchema.statics.findByCommentId=function(commentId, cb){
    return this.find({_id:commentId}, cb);
};

module.exports = mongoose.model('Comment', commentSchema);