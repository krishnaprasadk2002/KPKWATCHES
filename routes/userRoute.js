const express = require("express")
const userRoute=express()

userRoute.set('view engine','ejs')
userRoute.set('views','./views/users')
const flash=require("express-flash")

const session=require("express-session")
const config=require("../config/config")
userRoute.use(session({secret: config.sessionSecret,
    resave: false, 
    saveUninitialized: true  
  }));

  
  userRoute.use(flash())

const bodyparser=require("body-parser")
userRoute.use(bodyparser.json())
userRoute.use(bodyparser.urlencoded({extended:true}))

const UserAuth=require("../middleware/userAuth")

// userRoute.use((req, res, next) => {
//   console.log(req.url, req.method);
//   next();
// })

//sign up
const userController=require("../controllers/userControllers")
userRoute.get("/register",UserAuth.isLogout,userController.loadRegister)
userRoute.post("/register",userController.insertUser)


userRoute.get("/otp",UserAuth.isLogout,userController.loadotp)
userRoute.post('/otp',userController.verifyOtp);
userRoute.get('/resendOtp',userController.resendOtp)



//login
userRoute.post("/login",userController.verifyLogin)
userRoute.get("/login",UserAuth.isLogin,userController.loginLoad)

//home
userRoute.get("/",userController.loadHome)
userRoute.get("/home",UserAuth.isLogin,userController.loadHome)

//product
const productController=require("../controllers/productController")
userRoute.get("/product",userController.loadProduct)
userRoute.get("/eachproduct",productController.singleProduct)

//logout
userRoute.get("/logout",userController.userLogout)

// userRoute.get('*', (req, res)=>{
//     res.status(404).render('404');
//   });





//=========================================================Cart handling========================================================
const cartController=require("../controllers/cartController")

userRoute.get("/cart",cartController.loadCart)
userRoute.post("/addingcart/:productid/:quentity",cartController.addToCart)
userRoute.get("/addtocart",cartController.addToCart)
userRoute.post('/removeFromCart',cartController.removeCart);
userRoute.post('/updatequentity',cartController.updateQuentity)

//========================================================Checkouts============================================================
userRoute.get("/checkout",cartController.loadCheckout)
userRoute.get("/address",cartController.loadAddAddress)
userRoute.post("/address",cartController.addAddress)

const orderController=require("../controllers/orderController")
userRoute.post("/placeorder",orderController.placeOrder)

//===================================================User profile==============================================
userRoute.get("/profile",userController.userProfile)
userRoute.post("/submitprofile",userController.editProfile)
userRoute.post('/changepassword',userController.changePassword)
// userRoute.post("/cancelOrder/:orderId/:productId",orderController.cancelOrPlacedOrder)
userRoute.delete('/removeaddress/:id', userController.removeAddress);
userRoute.post('/addAddressProfile',userController.addAddressProfile)
userRoute.post('/updateaddress/:id',userController.editAddress)
userRoute.post('/cancelOrder/:orderId/:productId',orderController.cancelOrPlacedOrder)



module.exports=userRoute