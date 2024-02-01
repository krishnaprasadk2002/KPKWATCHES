const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        min:0,
        required: true,
    },
    offerprice: {
        type: Number,
        min:0,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories'
    },
    
    quentity:{
        type: Number,
        min:0,
        required: true,
    },
    date:{
        type: Date,
        required:true
    },
    image:{
        type:[String],
        required:true
    },
    is_listed:{
        type:String,
        enum:["Listed","Unlisted"],
        default:"Listed",
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'offer'
      },

});

const Products = mongoose.model('Products', productSchema);
module.exports=Products