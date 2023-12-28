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
    status:{
        type:String,
        enum:["active","blocked"],
        default:"active"              
    }

})

const Category= mongoose.model("Categories",productCategory)

module.exports=Category