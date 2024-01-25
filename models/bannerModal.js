const mongoose=require("mongoose")
const bannerSchema=mongoose.Schema({

    image:{
        type:[String],
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    location: {
        type: String,
        required: true, //location
      },
      status: {
        type: Boolean,
        default: true,
      },
})
const Banner=mongoose.model('banner',bannerSchema)
module.exports=Banner