let mongoose =  require('mongoose');
let Schema = mongoose.Schema;

//商品问答
let productIssueSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, required: true}, //商品ID
    customerId: { type: Schema.Types.ObjectId, required: true}, //客户ID
    issue: { type: String, required: true,maxlength:100}, //问题
    issueDate: { type: Date, default: Date.now}, //提问时间
    answer:String,  //回答
    updated: { type: Date, default: Date.now}
});

/**
 *here can add same methods or statics
 */
productIssueSchema.statics.findByProductIssueId=function(productIssueId, cb){
    return this.find({_id:productIssueId}, cb);
};

module.exports = mongoose.model('ProductIssue', productIssueSchema);