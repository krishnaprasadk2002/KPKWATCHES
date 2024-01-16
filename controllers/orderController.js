const User = require("../models/userModel");
const Products = require("../models/productModel");
const Cart = require("../models/cartModel");
const Orders = require("../models/orderModel");




const placeOrder = async (req, res) => {
    try {
        const selectedValue = req.body.selectedValue;
        const cartId = req.session.user_id;
        const cart = await Cart.findOne({ userid: cartId });

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
            paymentMode: 'Cash on Delivery',
            total: products.reduce((acc, product) => acc + product.total, 0),
            date: new Date(),
            address: selectedValue,
        };


        const orderInstance = new Orders(orderData);

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

        res.json({ success: true, products: products });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'An error occurred while processing the order or updating product stock.' });
    }
};


  const cancelOrPlacedOrder=async (req,res)=>{
    try {
        const orderId = req.params.orderId;
        const productId = req.params.productId


        const updatedOrder=await Orders.updateOne({
            _id: orderId,
            'Products._id': productId
            
        },
        {
            $set: {
                'Products.$.orderStatus': 'cancelled',
            }
        })
        res.json({
            success: true,
            message: "Product cancelled successfully",
            updatedOrder,
          });
          console.log(updatedOrder);
    } catch (error) {
        console.error("Error cancelling product:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    
    }
  }


  const returnOrder= async(req,res)=>{
    try {
        const productId=req.params.productId
        const orderId=req.params.orderId

        const updatedOrder=await Orders.updateOne({
            _id:orderId,
            'Products._id': productId
        },
        {
            $set:{
                'Products.$.orderStatus':'request return'
            }
        })
        res.json({
            success: true,
            message: "Product Return Request successfully",
            updatedOrder,
          });
          console.log(updatedOrder);
    } catch (error) {
        console.error("Error returning product:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

//=======================================================================Admin side Order======================================================
  //Load Order in Admin side

  const loadOrder=async(req,res)=>{
    try {
        const admin=req.session.admin
        const allOrders=await Orders.find()
        .populate({
            path: "Products.productId",
            model: "Products", 
          })
          .populate('user','name').exec();
        res.render("orders",{allOrders})
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
 // Update all products in the array
                    'Products.$[].orderStatus': status,  
                    'orderStatus': status,  // Update the overall order status
                },
            }
        );

        // console.log('result:', updatedOrder);

        if (updatedOrder.nModified === 0) {
            return res.status(404).json({ error: 'Order not found or status already updated' });
        }

        // Send a response indicating success
        res.json({ success: true, message: 'Status updated successfully' });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

 
  
  module.exports = {
    placeOrder,
    cancelOrPlacedOrder,
    loadOrder,
    changeStatus,
    returnOrder
  };
  