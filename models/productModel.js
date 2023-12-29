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
    Category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Categories', // Make sure it matches the model name for the Category
    },
    
    status: {
        type: String,
        enum: ['Active', 'Block'],
        default: 'Active',
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
    }

});

const Products = mongoose.model('Products', productSchema);
module.exports=Products