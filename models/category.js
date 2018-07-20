/**
 * Created by wyf on 2017/1/13.
 */
let mongoose =  require('mongoose');
let Schema = mongoose.Schema;

let categorySchema = new Schema({
    name: String,
    updated: { type: Date, default: Date.now }
});

/**
 *here can add same methods or statics
 */
categorySchema.statics.findByCategoryId=function(categoryId, cb){
    return this.find({_id:categoryId}, cb);
};

module.exports = mongoose.model('Category', categorySchema);