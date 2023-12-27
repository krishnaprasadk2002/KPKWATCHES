const mongoose=require("mongoose")
const productCategory=mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["active","blocked"],
        default:"active"              // set default active
    }

})

const Category= mongoose.model("Categories",productCategory)

module.exports=Category