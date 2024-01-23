const mongoose=require("mongoose")
const whishlistSchema=mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    products:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"product",
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        name:{
            type:String,
            required:true
        }
    }]
})
module.exports=mongoose.model('whishlist',whishlistSchema)