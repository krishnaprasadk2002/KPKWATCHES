const mongoose = require("mongoose")
const ordersSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    Products: [{

        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',

        },
        name: {
            type: String,

        },
        price: {
            type: Number,

        },
        quentity: {
            type: Number,

        },
        total: {
            type: Number,

        },
        orderStatus: {
            type: String,
            default: 'placed',
            enum: ['placed', 'shipped', 'delivered', 'request return', 'returned', 'request cancellation', 'cancelled']
        },
        reason:{
            type: String
        },
        image:{
            type:String,
            required:true
        }
    }
],
    paymentMode: {
        type: String,

    },
    paymentStatus:{
        type:String,
        default:"pending"
    },
    total: {
        type: Number
    },
    date: {
        type: Date
    },
    address: {
        type: Object
    },

},
{ timestamps: true }
);

const Orders=mongoose.model('orders',ordersSchema)
module.exports=Orders