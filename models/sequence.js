let mongoose =  require('mongoose');
let Schema = mongoose.Schema;

let sequenceSchema = new Schema({
    sequenceType: { type: String, required: true}, //序列类型
    sequenceNum: { type: Number, required: true} //序列号
});

sequenceSchema.statics.findBySequenceType=function(sequenceType, cb){
    return this.find({sequenceType:sequenceType}, cb);
};

module.exports = mongoose.model('Sequence', sequenceSchema);