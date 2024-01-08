const User=require("../models/userModel")
const Products=require("../models/productModel")
const Category=require("../models/categoryModel")
const Cart=require("../models/cartModel")

const loadCart=async (req,res)=>{
    try {
        const user = req.session.user_id
        const cartData = await Cart.findOne({ userid: user }).populate({
            path: "products.productId",
            model: "Products", // Make sure it matches the model name for the Product
          });
        if (cartData) {
            const totalCost = cartData.products.reduce((total, product) => {
              return total + product.totalPrice;
            }, 0);
      
            res.render("cartpage", { cartData,totalCost });
          }else{
      
              res.render("cartpage", {cartData});
          }
    } catch (error) {
        console.log(error.message);
    }
}

const addToCart = async (req, res) => {
    try {
        const product_id = req.params.productid; 
        const user_id = req.session.user_id;
        const quantity = parseInt(req.params.quantity);

        const productToCart = await Products.findOne({ _id: product_id }); 
        console.log("Product:", productToCart);

        const cart = await Cart.findOne({ userid: user_id });
        console.log("Cart:", cart);

        if (productToCart && user_id) {
            if (cart) {
                const existingProductIndex = cart.products.findIndex(
                    (item) => item.productId.toString() === product_id
                );

                if (existingProductIndex !== -1) {
                    const existingProduct = cart.products[existingProductIndex];
                    existingProduct.quantity += quantity;
                    existingProduct.totalPrice =
                        existingProduct.quantity * existingProduct.productPrice;
                } else {
                    cart.products.push({
                        productId: product_id,
                        quantity: quantity,
                        productPrice: productToCart.offerprice,
                        totalPrice: quantity * productToCart.offerprice,
                        Image: productToCart.image[0],
                    });
                }

                await cart.save();
                console.log("Cart updated:", cart);
            } else {
                const newCart = new Cart({
                    userid: user_id,
                    products: [
                        {
                            productId: product_id,
                            quantity: quantity,
                            productPrice: productToCart.offerprice,
                            totalPrice: quantity * productToCart.offerprice,
                            Image: productToCart.image[0],
                        },
                    ],
                });

                await newCart.save();
                console.log("New cart created:", newCart);
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


//   const loadCheckout=async(req,res)=>{
//     try {
//         const userid=req.session.user_id
//         const user=await User.findById({_id:userid})
//         const cartData=await Cart.findOne({userid:userid}).populate({path:'products.poductId',model:Product})
       
//         const totalCost = cartData.products.reduce((total, product) => {
//             return total + product.totalPrice;
//           }, 0);

//           res.render("checkout",(userid,user,cartData,totalCost))
//     } catch (error) {
//         console.log(error.message);
//     }
//   }
  



module.exports={
    loadCart,
    addToCart,
    // loadCheckout
}
