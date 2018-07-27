let mongoose =  require('mongoose');
let Schema = mongoose.Schema;

let customerSchema = new Schema({
    username: { type: String, required: true,unique:true,trim:true },
    password:{ type: String, required: true },
    mobile:{ type: String, required: true ,unique:true,maxlength:11},
    nickname:{ type: String, trim:true }, //昵称
    gender:String,  //性别
    headImg:String, //头像
    brithDay:Date,  //生日
    mail:String,    //邮箱
    updated: { type: Date, default: Date.now }
});

/**
 *here can add same methods or statics
 */
customerSchema.statics.findByCustomerId=function(customerId, cb){
    return this.find({_id:customerId}, cb);
};

module.exports = mongoose.model('Customer', customerSchema);