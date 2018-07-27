let mongoose =  require('mongoose');
let Schema = mongoose.Schema;

//商品评论
let commentSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, required: true}, //商品ID
    customerId: { type: Schema.Types.ObjectId, required: true}, //客户ID
    orderId: { type: Schema.Types.ObjectId, required: true}, //订单ID
    commentCotent: { type: String, required: true,maxlength:200}, //评论内容
    commentStar: { type: Number, required: true}, //评论星级
    updated: { type: Date, default: Date.now}
});

/**
 *here can add same methods or statics
 */
commentSchema.statics.findByCommentId=function(commentId, cb){
    return this.find({_id:commentId}, cb);
};

module.exports = mongoose.model('Comment', commentSchema);