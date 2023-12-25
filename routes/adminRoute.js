const express=require("express")
const adminRoute=express()
const users=require('../models/userModel')
const multer=require("multer")
// const { join } = require('path'); // Import the join function from the path module
const path =require("path")
const productController=require("../controllers/productController")
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

adminRoute.get("/",adminController.loadLogin)
adminRoute.post("/",adminController.verifyLogin)


adminRoute.post("/dashboard",adminController.loadDashboard);
adminRoute.get("/dashboard",adminController.loadDashboard);

// All user
adminRoute.get("/alluser",adminController.loadAlluser)

//Admin status
adminRoute.post('/activeuser/:id', adminController.activeUser);
adminRoute.post('/blockuser/:id', adminController.blockUser);

//All product
adminRoute.get('/allproduct',adminController.loadAllproduct)






//Add product
adminRoute.get('/addproduct',adminController.loadAddproducts)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
    // cb(null, join(__dirname, '..', 'public', 'uploads')); // it is also applicable but that time enable {join} upward.
  },
  filename: function (req, file, cb) {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const name = formattedDate + '_' + file.originalname;
    cb(null, name);
  },
});
const upload = multer({ storage: storage });
adminRoute.post("/addproduct", upload.array('image', 5),productController.insertProduct);




//Logout
adminRoute.get("/logout",adminController.adminLogout)
adminRoute.get("*",(req,res)=>{
    res.redirect('/admin')
  })


module.exports=adminRoute