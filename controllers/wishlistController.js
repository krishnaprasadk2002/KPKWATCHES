const User = require("../models/userModel");
const Products = require("../models/productModel")
const Category = require("../models/categoryModel");
const Orders = require("../models/orderModel");
const Wishlist = require("../models/WhishlistModel");
const Cart=require('../models/cartModel')
//===============================================================Wish list=================================================================

//Load whishlist
const loadWhishlist = async (req, res) => {
    try {
      const user=req.session.user_id
      const wishlist=await Wishlist.findOne({user:user}).populate({
        path:"products.productId",
        model:"Products"
      }).exec()
  
      res.render("wishlist",{wishlist})
    } catch (error) {
      console.log(error.message);
    }
  }
  
  //adding to wishlist
  
  const addToWishlist = async (req, res) => {
    try {
      const productId = req.params.productid;
      const userId = req.session.user_id; 
  
      if (!userId) {
        res.redirect("/login")
      }
  
      const productToWishlist = await Products.findOne({ _id: productId });
  
      const wishlist = await Wishlist.findOne({ user: userId });
   
       const productPrice = productToWishlist.offerprice || productToWishlist.price
      if (!wishlist) {
        const newWishlist = new Wishlist({
          user: userId,
          products: [{
            productId: productId,
            name: productToWishlist.name,
            price: productPrice,
            Image: productToWishlist.image[0]
          }]
        });

        console.log("wish",wishlist);
  
        const savedWishlist = await newWishlist.save();
        return res.status(200).json({ message: 'Product added to wishlist successfully.', wishlist: savedWishlist });
      }
  
      const isProductInWishlist = wishlist.products.some(item => item.productId.equals(productId));
  
      if (isProductInWishlist) {

        await Wishlist.updateOne({user:userId},
          {$pull:{products:{productId:productId}}})
        return res.status(400).json({ error: 'Product is removed in wishlist' });
      }
  
      wishlist.products.push({
        productId: productId,
        name: productToWishlist.name,
        price: productPrice,
        Image: productToWishlist.image[0],
      });
  
      const updatedWishlist = await wishlist.save();
  
      res.status(200).json({ message: 'Product added to wishlist successfully.', wishlist: updatedWishlist });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  };
  
  //remove the wishlisted item
  
  const removeWishlist = async (req, res) => {
    try {
      const productId = req.body.productId;
      const user = req.session.user_id;
  
      const existingWishlist = await Wishlist.findOne({ user: user });
  
      if (!existingWishlist) {
        return res.status(404).json({ success: false, message: "Wishlist not found" });
      }
  
      existingWishlist.products = existingWishlist.products.filter(
        (wishitem) => !wishitem.productId.equals(productId)
      );
  
      const updatedWishlist = await existingWishlist.save();
  
      res.json({
        success: true,
        message: "Product removed from the wishlist",
        updatedWishlist,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  
  //wishlist add to cart and that time remove the cart
  
  const wishAddToCart = async (req, res) => {
    try {
      const productId = req.params.productid;
      const userId = req.session.user_id;
  
      const productToCart = await Products.findOne({ _id: productId });
      const cart = await Cart.findOne({ userid: userId });
      const wishlist = await Wishlist.findOne({ user: userId });

      if(!wishlist){
        res.redirect("/")
      }
  
      if (productToCart && userId) {
        const isProductInWishlist = wishlist && wishlist.products.some(item => item.productId.equals(productId));
  
        if (isProductInWishlist) {
          await Wishlist.updateOne(
            { user: userId },
            { $pull: { products: { productId: productId } } }
          );
        }
  
        if (cart) {
          const existingProductIndex = cart.products.findIndex(
            (item) => item.productId.toString() === productId
          );

  
          if (existingProductIndex !== -1) {
            const existingProduct = cart.products[existingProductIndex];
            existingProduct.quentity += 1;
            existingProduct.totalPrice =
              existingProduct.quentity * existingProduct.productPrice;
          } else {
            
            cart.products.push({
              productId: productId,
              quentity: 1,

              productPrice: productToCart.offerprice || productToCart.price,
              totalPrice: productToCart.offerprice || productToCart.price,
              Image: productToCart.image[0],
            });
          }
  
          await cart.save();
        } else {
          const newCart = new Cart({
            userid: userId,
            products: [
              {
                productId: productId,
                quentity: 1,
                productPrice: productToCart.offerprice || productToCart.price,
                totalPrice: productToCart.offerprice || productToCart.price,
                Image: productToCart.image[0],
              },
            ],
          });
  
          await newCart.save();
        }
  
        res.status(200).json({ message: "Product added to cart successfully." });
      } else {
        res.status(400).json({ error: "Invalid product or user." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
    }
  };
  
  module.exports={
    loadWhishlist,
    addToWishlist,
    removeWishlist,
    wishAddToCart
  }