let mongoose =  require('mongoose');
let Schema = mongoose.Schema;

//收货地址
let shippingAddressSchema = new Schema({
    customerId: { type: Schema.Types.ObjectId, required: true}, //客户ID
    name:{ type: String, required: true,trim:true }, //收货人姓名
    province:{ type: String, required: true}, //省
    city:{ type: String, required: true},     //市
    district:{ type: String, required: true}, //区
    address:{ type: String, required: true},  //详细地址
    mobile:{ type: String, required: true ,maxlength:11}, //手机
    isDefault:{ type: Boolean, default: false},   //是否默认地址
    updated: { type: Date, default: Date.now }
});

/**
 *here can add same methods or statics
 */
shippingAddressSchema.statics.findByShippingAddressId=function(addressId, cb){
    return this.find({_id:addressId}, cb);
};

module.exports = mongoose.model('ShippingAddress', shippingAddressSchema);