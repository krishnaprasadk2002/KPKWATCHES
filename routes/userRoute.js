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
  

const bodyparser=require("body-parser")
userRoute.use(bodyparser.json())
userRoute.use(bodyparser.urlencoded({extended:true}))

const UserAuth=require("../middleware/userAuth")

//sign up
const userController=require("../controllers/userControllers")
userRoute.get("/register",UserAuth.isLogout,userController.loadRegister)
userRoute.post("/register",userController.insertUser)

//login
userRoute.post("/login",userController.verifyLogin)
userRoute.get("/login",UserAuth.isLogout,userController.verifyLogin)

//home
userRoute.get("/",userController.loadHome)
userRoute.get("/home",userController.loadHome)


module.exports=userRoute