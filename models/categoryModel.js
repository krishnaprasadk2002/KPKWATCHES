const mongoose=require("mongoose")
const productCategory=mongoose.Schema({

    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true
    },
    is_listed: {
        type: String,
        enum: ['Listed', 'Unlisted'],
        default: 'Listed',
      },
      offer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"offer"
      }

})

const Category= mongoose.model("Categories",productCategory)

module.exports=Category