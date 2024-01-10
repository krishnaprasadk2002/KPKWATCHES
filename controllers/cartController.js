const User=require("../models/userModel")
const Products=require("../models/productModel")
const Category=require("../models/categoryModel")
const Cart=require("../models/cartModel")
const { response } = require("../routes/userRoute")

//load Cart page

const loadCart=async (req,res)=>{
    try {
        const user = req.session.user_id
        const cartData = await Cart.findOne({ userid: user }).populate({
            path: "products.productId",
            model: "Products", 
          });
          
        
        if (cartData) {
           
            const totalPriceTotal = await Cart.aggregate([
                {
                    $unwind: "$products" 
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$products.totalPrice" } 
                    }
                }
            ]);
            if (totalPriceTotal[0]!=undefined) {
                res.render("cartpage", { cartData,totalPriceTotal:totalPriceTotal[0].total});
            }
            else{
                res.render("cartpage");
            }
           
          }else{
      
              res.render("cartpage");
          }
    } catch (error) {
        console.log(error.message);
    }
}
//Product added to cart

const addToCart = async (req, res) => {
    try {
        const product_id = req.params.productid; 
        const user_id = req.session.user_id;
        const quentity = parseInt(req.params.quentity);

        const productToCart = await Products.findOne({ _id: product_id }); 
        // console.log("Product:", productToCart);

        const cart = await Cart.findOne({ userid: user_id });
        // console.log("Cart:", cart);

        if (productToCart && user_id) {
            if (cart) {
                const existingProductIndex = cart.products.findIndex(
                    (item) => item.productId.toString() === product_id
                );

                if (existingProductIndex !== -1) {
                    const existingProduct = cart.products[existingProductIndex];
                    existingProduct.quentity += quentity;
                    existingProduct.totalPrice =
                        existingProduct.quentity * existingProduct.productPrice;
                } else {
                    cart.products.push({
                        productId: product_id,
                        quentity: quentity,
                        productPrice: productToCart.offerprice,
                        totalPrice: quentity * productToCart.offerprice,
                        Image: productToCart.image[0],
                    });
                }

                await cart.save();
                // console.log("Cart updated:", cart);
            } else {
                const newCart = new Cart({
                    userid: user_id,
                    products: [
                        {
                            productId: product_id,
                            quentity: quentity,
                            productPrice: productToCart.offerprice,
                            totalPrice: quentity * productToCart.offerprice,
                            Image: productToCart.image[0],
                        },
                    ],
                });

                await newCart.save();
                // console.log("New cart created:", newCart);
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

//Remove Cart item

    const removeCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user_id;

        const existingCart = await Cart.findOne({ userid: userId });

        if (!existingCart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        // Remove the product from the cart
        existingCart.products = existingCart.products.filter((product) => !product.productId.equals(productId));

        // Save the updated cart
        const updatedCart = await existingCart.save();

        res.json({
            success: true,
            message: "Product removed from the cart",
            updatedCart,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

//update Quantity

const updateQuentity = async (req, res) => {
    try {
        const userid = req.session.user_id;
        const { cartId, productId, quentity } = req.body;

        const existingCart = await Cart.findById(cartId);

        if (!existingCart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const productToUpdate = existingCart.products.find((proId) => proId.productId.equals(productId));

        if (!productToUpdate) {
            return res.status(404).json({ success: false, message: "Product not found in cart" });
        }

        productToUpdate.quentity = quentity;
        productToUpdate.totalPrice = quentity * productToUpdate.productPrice;

        const updatedCart = await existingCart.save();
        const updatedTotalPrice = productToUpdate.totalPrice;
        const totalPriceTotal = existingCart.products.reduce((total, product) => total + product.totalPrice, 0);

        
        res.json({
            success: true,
            message: "Quantity updated successfully",
            updatedTotalPrice,
            totalPriceTotal,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

//===============================================================================started to ckeckOut ===============================================

const loadCheckout = async (req, res) => {
    try {
        const user_id = req.session.user_id;
        const user = await User.findById(user_id); 
        console.log(user);

        const cartData = await Cart.findOne({ userid: user }).populate({
            path: "products.productId",
            model: "Products", 
          });
          
        console.log(cartData);

        const totalPrice= cartData.products.reduce((total, product) => {
            return total + product.totalPrice;
        }, 0);

        res.render("checkout", { user, cartData , totalPrice });
    } catch (error) {
        console.log(error.message);
       
    }
};

//add address page

const loadAddAddress=async (req,res)=>{
    try {
        res.render("checkoutaddress")
    } catch (error) {
        console.log(error.message);
    }
}


//Add address in checkoutPage
const addAddress = async (req, res) => {
    try {
        const userId = req.session.user_id; 
        console.log(userId);
        const { name, mobile, pincode, address, city, state } = req.body;
        
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.address.push({
            name,
            mobile,
            pincode,
            address,
            city,
            state
        });

        const updatedUser = await user.save();
        
        res.redirect("/checkout");
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


module.exports={
    loadCart,
    addToCart,
    removeCart,
    updateQuentity,
    loadCheckout,
    loadAddAddress,
    addAddress,
}
