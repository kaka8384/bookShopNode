let mongoose =  require('mongoose');
let Schema = mongoose.Schema;

let categorySchema = new Schema({
    name: { type: String, required: true,unique:true,trim:true },
    updated: { type: Date, default: Date.now }
});

/**
 *here can add same methods or statics
 */
categorySchema.statics.findByCategoryId=function(categoryId, cb){
    return this.find({_id:categoryId}, cb);
};

module.exports = mongoose.model('Category', categorySchema);