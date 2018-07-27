let mongoose =  require('mongoose');
let Schema = mongoose.Schema;

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

module.exports = mongoose.model('User', userSchema);