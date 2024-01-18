const mongoose=require('mongoose')
const couponSchema=mongoose.Schema({

    couponName:{
        type:String,
        required:true
    },
    couponCode:{
        type:String,
        required:true
    },
    discountAmount:{
        type:Number
    },
    minAmount:{
        type:Number,
        required:true
    },
    couponDescription:{
        type:String,
        required:true
    },
    expiryDate:{
        type:Date,
    },
    status:{
        type:Boolean,
        default:true
    },
    userUsed:[{
        user_id:{
            type:mongoose.Types.ObjectId,
            ref:'User'
        },
        used:{
            type:Boolean,
            default:false
        }
    }]
},{timestamps:true})

couponSchema.pre('find', async function () {
    const currentDate = new Date();
    await this.model.updateMany(
        { expiryDate: { $lt: currentDate }, status: true },
        { $set: { status: false } }
    );
  });
  
  module.exports = mongoose.model('Coupon',couponSchema)