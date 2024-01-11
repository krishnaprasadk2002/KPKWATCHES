const User = require("../models/userModel");
const Products = require("../models/productModel");
const Cart = require("../models/cartModel");
const Orders = require("../models/orderModel");




const  placeOrder=async (req,res)=>{
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
              image:cartProduct.image,
              reason: cartProduct.cancellationReason,
          };
      }));
  
      
      const orderData = {
          user: req.session.user_id,
          Products: products,
          paymentMode: 'Cash on Delivery',
          total: products.reduce((acc, product) => acc + product.total, 0),
          date: new Date(),
          address: selectedValue,
      };
      
      const orderInstance = new Orders(orderData);
     
      const savedOrder = await orderInstance.save().then(async()=>{
          await Cart.deleteOne({userid:req.session.user_id})
      })
    
  
      res.json({ success: true, products: products });
  } catch (error) {
      console.error('Error:', error);
    
      res.status(500).json({ success: false, message: 'An error occurred while processing the order or updating product stock.' });
  }
  
  }
 
  
  module.exports = {
    placeOrder,
  };
  