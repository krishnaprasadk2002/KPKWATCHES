const User = require("../models/userModel")
const Products = require("../models/productModel")
const Category = require("../models/categoryModel")
const Cart = require("../models/cartModel")
const Coupons = require("../models/couponModel")
const { response } = require("../routes/userRoute")
const Offer = require("../models/offerModel")



const loadCart = async (req, res) => {
    try {
        const user = req.session.user_id;

        if(!user){
        res.redirect("/login")
        }
        const cartData = await Cart.findOne({ userid: user }).populate({
            path: "products.productId",
            model: "Products",
        });

        if (cartData.products.length > 0) {
            cartData.products.forEach((product) => {
                const productPrice = product.productId.offerprice || product.productId.price;
                product.productTotalPrice = productPrice * product.quentity;
            });

            const totalPriceTotal = cartData.products.reduce((total, product) => total + product.productTotalPrice, 0);

            res.render("cartpage", { cartData, totalPriceTotal });
        } else {
            res.render("cartpage", { cartData });
        }
    } catch (error) {
        res.redirect("/500")
    }
};

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
                    existingProduct.quentity
                    // += quentity;
                    existingProduct.totalPrice = existingProduct.quentity * existingProduct.productPrice;
                } else {

                    const productPrice = productToCart.offerprice || productToCart.price
                    const totalPrice = quentity * productPrice

                    cart.products.push({
                        productId: product_id,
                        quentity: quentity,
                        productPrice: productPrice,
                        totalPrice: totalPrice,
                        Image: productToCart.image[0],
                    });
                }

                await cart.save();
                // console.log("Cart updated:", cart);
            } else {
                const productPrice = productToCart.offerprice || productToCart.price
                const totalPrice = quentity * productPrice

                const newCart = new Cart({
                    userid: user_id,
                    products: [
                        {
                            productId: product_id,
                            quentity: quentity,
                            productPrice: productPrice,
                            totalPrice: totalPrice,
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
        res.redirect("/500")
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
        res.redirect("/500")
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

        // const maxQuentity = productToUpdate.quentity
        // console.log("max",quentity);
        // if(maxQuentity<quentity){
        //     return res.status(400).json({ success: false, message: `Exceeded maximum quantity limit (${maxQuentity}).` });
        // }

        // Assuming existingCart is an instance of your cart model
        productToUpdate.quentity = quentity;
        productToUpdate.totalPrice = quentity * (productToUpdate.offerPrice || productToUpdate.productPrice);

        const updatedCart = await existingCart.save();
        const updatedTotalPrice = productToUpdate.totalPrice;
    

        const totalPriceTotal = existingCart.products.reduce((total, product) => {
            const productPrice = product.offerPrice || product.productPrice;
            return total + productPrice * product.quentity;
        }, 0);



        res.json({
            success: true,
            message: "Quantity updated successfully",
            updatedTotalPrice,
            totalPriceTotal,
        });
    } catch (error) {
        res.redirect("/500")
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

//===============================================================================started to ckeckOut ===============================================

const loadCheckout = async (req, res) => {
    try {
        const user_id = req.session.user_id;
        const coupon = await Coupons.find({ 'userUsed.used': { $ne: true } });

        const couponCode = req.query.coupon || ''
        // console.log("code:", couponCode);
        const user = await User.findById(user_id);

        if (!req.session.user_id) {
            res.redirect("/")
        } else {
            const cartData = await Cart.findOne({ userid: user }).populate({
                path: "products.productId",
                model: "Products",
            });

            const totalWithoutDiscount = cartData.products.reduce((acc, product) => {
                const price = product.productId.offerprice || product.productId.price;
                return acc + price * product.quentity;
            }, 0);

            let totalWithDiscount = totalWithoutDiscount;

            if (couponCode) {
                const coupon = await Coupons.findOne({ couponCode });

                if (coupon) {
                    const discountAmount = coupon.discountAmount;
                    totalWithDiscount -= discountAmount;
                }
            }



            res.render("checkout", { user, cartData, totalWithDiscount, totalWithoutDiscount, coupon });
        }
    } catch (error) {
       res.redirect("/500")

    }
};

// const loadCheckout = async (req, res) => {
//     try {
//         const user_id = req.session.user_id;
//         const coupon=await Coupons.find()
//         const couponCode=req.query.coupon||''
//        console.log("code:",couponCode);
//         const user = await User.findById(user_id); 

//          if(!req.session.user_id){
//             res.redirect("/")
//          } else {
//             const cartData = await Cart.findOne({ userid: user }).populate({
//                 path: "products.productId",
//                 model: "Products", 
//             });

//             const totalWithoutDiscount = cartData.products.reduce((acc, product) => {
//                 return acc + product.totalPrice;
//             }, 0);

//             let totalWithDiscount = totalWithoutDiscount;

//             if (couponCode) {
//                 const coupon = await Coupons.findOne({ couponCode });

//                 if (coupon) {
//                     const discountAmount = coupon.discountAmount;
//                     totalWithDiscount -= discountAmount;

//                     // Update coupon usage
//                     const alreadyUsed = coupon.userUsed.some((user) => user.userid.toString() === user_id);
//                     if (!alreadyUsed) {
//                         coupon.userUsed.push({ userid: user_id });
//                         await coupon.save();
//                     }
//                 }
//             }

//             res.render("checkout", { user, cartData, totalWithDiscount, totalWithoutDiscount, coupon });
//         }
//     } catch (error) {
//        res.redirect("/500")
//     }
// };



//add address page

const loadAddAddress = async (req, res) => {
    try {
        res.render("checkoutaddress")
    } catch (error) {
       res.redirect("/500")
    }
}


//Add address in checkoutPage
const addAddress = async (req, res) => {
    try {
        const userId = req.session.user_id;
        // console.log(userId);
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
       res.redirect("/500")
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {
    loadCart,
    addToCart,
    removeCart,
    updateQuentity,
    loadCheckout,
    loadAddAddress,
    addAddress,
}
