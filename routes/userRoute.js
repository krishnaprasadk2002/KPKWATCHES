const express = require("express")
const userRoute=express()

userRoute.set('view engine','ejs')
userRoute.set('views','./views/users')

const session=require("express-session")
const config=require("../config/config")
userRoute.use(session({secret: config.sessionSecret,
    resave: false, 
    saveUninitialized: true  
  }));
  const flash=require("express-flash")
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
userRoute.get("/register",userController.loadRegister)
userRoute.post("/register",userController.insertUser)


userRoute.get("/otp",userController.loadotp)
userRoute.post('/otp',userController.verifyOtp);


//login
userRoute.post("/login",userController.verifyLogin)
userRoute.get("/login",UserAuth.isLogin,userController.verifyLogin)

//home
userRoute.get("/",userController.loadHome)
userRoute.get("/home",userController.loadHome)

//product
const productController=require("../controllers/productController")
userRoute.get("/product",userController.loadProduct)
userRoute.get("/eachproduct",productController.singleProduct)

//logout
userRoute.get("/logout",userController.userLogout)

module.exports=userRoute