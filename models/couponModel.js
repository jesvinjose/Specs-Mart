const mongoose=require('mongoose')

const couponSchema=new mongoose.Schema({
    couponName:{
        type:String,
        required:true
    },
    couponCode:{
        type:String,
        required:true
    },
    discountAmount:{
        type:Number,
        required:true
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    isDisabled:{
        type:Boolean,
        default:false
    },
    usedBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]
})

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;