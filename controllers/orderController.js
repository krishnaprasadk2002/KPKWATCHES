const User = require("../models/userModel");
const Products = require("../models/productModel");
const Cart = require("../models/cartModel");
const Orders = require("../models/orderModel");
const Razorpay = require("razorpay");
const Coupons = require("../models/couponModel")
const { response } = require("express");

//==========================================================Razorpay instance===============================

var instance = new Razorpay({ key_id: process.env.RazorId, key_secret: process.env.RazorKey });

//=====================================================Order Placing========================================

const placeOrder = async (req, res) => {
    try {
        console.log(req.body)
        const paymentMethod = req.body.paymentMethod;
        const selectedValue = req.body.selectedValue;
        const cartId = req.session.user_id;
        const { couponCode } = req.body;
        const cart = await Cart.findOne({ userid: cartId });
        const userId = req.session.user_id;
        const currentDate=new Date()

        const products = await Promise.all(cart.products.map(async (cartProduct) => {
            const productDetails = await Products.findById(cartProduct.productId);
            return {
                productId: cartProduct.productId,
                name: productDetails.name,
                price: productDetails.price,
                quentity: cartProduct.quentity,
                total: cartProduct.totalPrice,
                orderStatus: cartProduct.status,
                image: productDetails.image,
                reason: cartProduct.cancellationReason,
            };
        }));

        const totalWithoutDiscount = products.reduce((acc, product) => {
            return acc + product.total;
        }, 0);
        
        let totalWithDiscount = totalWithoutDiscount;
        
        if (couponCode) {
            const coupon = await Coupons.findOne({ couponCode });
        
            if (coupon) {
                if (coupon && coupon.expiryDate >= currentDate && coupon.minAmount <= totalWithDiscount) {
                    const discountAmount = coupon.discountAmount;
                    totalWithDiscount -= discountAmount;
        
                    coupon.userUsed.push({ userId, used: true });
                    await coupon.save();
                }
            }
        }
        const orderData = {
            user: req.session.user_id,
            Products: products.map(product => ({
                productId: product.productId,
                name: product.name,
                price: product.price,
                quentity: product.quentity,
                total: product.total,
                orderStatus: product.orderStatus,
                image: product.image[0],
                reason: product.reason,
            })),
            paymentMode: paymentMethod,
            total: totalWithDiscount,
            date: new Date(),
            address: selectedValue,
        };

        const orderInstance = new Orders(orderData);

        if (paymentMethod === "Cash on delivery") {
            try {
                orderInstance.paymentStatus = "COD"
                const savedOrder = await orderInstance.save().then(async () => {
                    await Cart.deleteOne({ userid: req.session.user_id });
    
                    for (let i = 0; i < cart.products.length; i++) {
                        const productId = cart.products[i].productId;
                        const count = cart.products[i].quentity;
    
                        await Products.updateOne({
                            _id: productId
                        }, {
                            $inc: {
                                quentity: -count
                            }
                        });
                    }
                });
    
                res.json({ success: true, order: savedOrder });
            } catch (error) {
                res.status(500).json({ success: false, message: 'OD not working properly.' });
            }
        } else if (paymentMethod === "Razorpay") {
            const totalpriceInPaise = Math.round(totalWithDiscount * 100);
            const minimumAmount = 100;
            const total = Math.max(totalpriceInPaise, minimumAmount);
            generateRazorpay(orderInstance._id, total).then(async (response) => {
                const savedOrder = await orderInstance.save();
                res.json({ response, total: total, order: savedOrder });
            });
        } else if (paymentMethod === "wallet") {
            try {
                orderInstance.paymentStatus = "wallet"

                const user=await User.findById(req.session.user_id)
                if( user.wallet < totalWithDiscount){
                    return res.json({ success: false, message: 'Insufficient wallet balance' });
                }
                const savedOrder = await orderInstance.save();

                await Cart.deleteOne({ userid: req.session.user_id });

                for (let i = 0; i < cart.products.length; i++) {
                    const productId = cart.products[i].productId;
                    const count = cart.products[i].quentity;

                    await Products.updateOne({
                        _id: productId
                    }, {
                        $inc: {
                            quentity: -count
                        }
                    });
                }

                await User.updateOne({
                    _id: req.session.user_id
                }, {
                    $inc: {
                        wallet: -totalWithDiscount
                    },
                    $push: {
                        wallet_history: {
                            date: new Date(),
                            amount: `-${totalWithDiscount}`,
                            reason: 'ordered with wallet'
                        }
                    }
                });

                res.json({ success: true, order: savedOrder });
            } catch (error) {
                console.error('Wallet order error:', error);
                res.status(500).json({ success: false, message: 'Wallet order error' });
            }
        }
    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({ success: false, message: 'An error occurred while processing the order.' });
    }
};


const generateRazorpay = (orderId, total) => {
    return new Promise((resolve, reject) => {
        const options = {
            amount: total,
            currency: "INR",
            receipt: "" + orderId
        };

        instance.orders.create(options, function (error, order) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                resolve({ order, orderId });
            }
        });
    });
};


const verifyPayment = async (req, res) => {
    try {
        const userid = req.session.user_id;
        const { payment, order } = req.body;
        const Crypto = require("crypto");
        const orderId = order.order.receipt;
        // console.log('Response:', response);

        // console.log("payment:", payment);
        // console.log("Order:", order);
        // console.log("orderId",orderId);
        // console.log("order",order);

        const secret = process.env.RazorKey;
        let hmac = Crypto.createHmac('sha256', secret);
        hmac.update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id);
        hmac = hmac.digest('hex');

        if (hmac === payment.razorpay_signature) {
            const order = await Orders.findById(orderId);
            if (order) {
                order.paymentStatus = "Razorpay";
                await order.save();
            }

            const cart = await Cart.findOne({ userid: userid });
            if (cart && cart.products && cart.products.length > 0) {
                for (let i = 0; i < cart.products.length; i++) {
                    const productId = cart.products[i].productId;
                    const count = cart.products[i].quentity;

                    await Products.updateOne(
                        { _id: productId },
                        {
                            $inc: {
                                quentity: -count
                            }
                        }
                    );
                }
            }

            await Cart.deleteOne({ userid: userid });
            res.json({ payment: true });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

//===========================================Order success page =========================================================
const loadOrderSuccess = async (req, res) => {
    try {

        res.render("ordersuccess")
    } catch (error) {
        console.log(error.message);
    }
}

const cancelOrPlacedOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const productId = req.params.productId
       


        const updatedOrder = await Orders.updateOne({
            _id: orderId,
            'Products._id': productId

        },
            {
                $set: {
                    'Products.$.orderStatus': 'request cancellation',
                }
            })
            
        res.json({
            success: true,
            message: "Product cancelled successfully",
            updatedOrder,
        });

    } catch (error) {
        console.error("Error cancelling product:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });

    }
}


const returnOrder = async (req, res) => {
    try {
        const productId = req.params.productId
        const orderId = req.params.orderId
        

        const updatedOrder = await Orders.updateOne({
            _id: orderId,
            'Products._id': productId
        },
            {
                $set: {
                    'Products.$.orderStatus': 'request return'
                }
            })
        res.json({
            success: true,
            message: "Product Return Request successfully",
            updatedOrder,
        });
        
    } catch (error) {
        console.error("Error returning product:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

//=======================================================================Admin side Order======================================================
//Load Order in Admin side

const loadOrder = async (req, res) => {
    try {
        const admin = req.session.admin
        const allOrders = await Orders.find()
    .populate({
        path: "Products.productId",
        model: "Products",
    })
    .populate('user', 'name').exec();
        res.render("orders", { allOrders })
    } catch (error) {
        console.log(error.message);
    }
}


//change status

const changeStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    try {
        const updatedOrder = await Orders.updateOne(
            {
                _id: orderId,
                'Products': {
                    $elemMatch: {
                        'orderStatus': { $ne: status }
                    }
                }
            },
            {
                $set: {
                    'Products.$[].orderStatus': status,
                    'orderStatus': status,
                },
            }
        );

        const orderData = await Orders.findOne({ _id: orderId });
        const products = orderData.Products;
        const userId = orderData.user;

        let totalAmountofWallet = orderData.total;
        console.log("total return",totalAmountofWallet);
        console.log("Status",status);
        if (status === "returned") {
            for (let i = 0; i < products.length; i++) {
                const productId = products[i].productId;
                const count = products[i].quentity;

                await Products.updateOne(
                    { _id: productId },
                    {
                        $inc: {
                            quentity: count
                        }
                    }
                );
            }


            await User.findByIdAndUpdate(
                { _id: userId },
                {
                    $inc: {
                        wallet: totalAmountofWallet
                    },
                    $push: {
                        wallet_history: {
                            date: new Date(),
                            amount: totalAmountofWallet ,
                            reason: 'order return'
                        }
                    }
                }
            );

        }else if (status === "cancelled" && orderData.paymentMode !== "Cash on delivery") {
            for (let i = 0; i < products.length; i++) {
                const productId = products[i].productId;
                const count = products[i].quentity;
        
                await Products.updateOne(
                    { _id: productId },
                    {
                        $inc: {
                            quentity: count
                        }
                    }
                );
            }
        
            await User.findByIdAndUpdate(
                { _id: userId },
                {
                    $inc: {
                        wallet: totalAmountofWallet
                    },
                    $push: {
                        wallet_history: {
                            date: new Date(),
                            amount: totalAmountofWallet,
                            reason: 'cancel order'
                        }
                    }
                }
            );

        }

        if (updatedOrder.nModified === 0) {
            return res.status(404).json({ error: 'Order not found or status already updated' });
        }

        res.json({ success: true, message: 'Status updated successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



module.exports = {
    placeOrder,
    verifyPayment,
    cancelOrPlacedOrder,
    loadOrder,
    changeStatus,
    returnOrder,
    loadOrderSuccess

};

