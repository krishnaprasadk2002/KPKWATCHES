const express=require("express")
const adminRoute=express()
const users=require('../models/userModel')

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
const adminAuth=require("../middleware/adminAuth")

adminRoute.get("/",adminAuth.islogout,adminController.loadLogin)
adminRoute.post("/",adminAuth.islogout,adminController.verifyLogin)


adminRoute.post("/dashboard",adminController.loadDashboard);
adminRoute.get("/dashboard",adminController.loadDashboard);


// All user
adminRoute.get("/alluser",adminController.loadAlluser)








adminRoute.post('/activeuser/:id',async (req,res)=>{
  const user_id=req.params.id
  const check= await users.findByIdAndUpdate({_id:user_id},{status:"Active"})
  const status=check.status
 res.json({status:status})

})

adminRoute.post('/blockuser/:id', async (req,res)=>{
  const user_id=req.params.id
  const check=await users.findByIdAndUpdate({_id:user_id},{status:"Block"})
  const status=check.status
  res.json({status:status})
})






//Logout

adminRoute.get("/logout",adminAuth.islogin,adminController.adminLogout)

adminRoute.get("*",(req,res)=>{
    res.redirect('/admin')
  })


module.exports=adminRoute