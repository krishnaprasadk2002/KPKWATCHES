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
    },
    is_listed:{
        type:String,
        enum:["Listed","Unlisted"],
        default:"Listed",
    }

})

const Category= mongoose.model("Categories",productCategory)

module.exports=Category