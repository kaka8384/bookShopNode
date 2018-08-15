let mongoose =  require('mongoose');
let Schema = mongoose.Schema;

//后台管理员用户
let userSchema = new Schema({
    username: { type: String, required: true,unique:true,trim:true,lowercase:true},
    password:{ type: String, required: true},
    updated: { type: Date, default: Date.now }
});

/**
 *here can add same methods or statics
 */
userSchema.statics.findByUserId=function(userId, cb){
    return this.find({_id:userId}, cb);
};

userSchema.statics.findByUserName=function(username, cb){
    return this.find({username:new RegExp(username, 'i')}, cb);
};

module.exports = mongoose.model('User', userSchema);