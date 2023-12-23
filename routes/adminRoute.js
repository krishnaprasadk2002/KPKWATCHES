const express=require("express")
const adminRoute=express()

const session=require("express-session")
const config=require("../config/config")
adminRoute.use(session({secret: config.sessionSecret,
    resave: false, 
    saveUninitialized: true  
  }));

  const bodyparser=require("body-parser")
  adminRoute.use(bodyparser.json())
  adminRoute.use(bodyparser.urlencoded({extended:true}))

adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')

const adminController=require("../controllers/adminController")

adminRoute.get("/",adminController.loadLogin)

adminRoute.post("/",adminController.verifyLogin)


adminRoute.post("/dashboard", adminController.loadDashboard);


adminRoute.get("*",(req,res)=>{
    res.redirect('/admin')
  })


module.exports=adminRoute