const express=require("express")
const adminRoute=express()
const users=require('../models/userModel')
const multer=require("multer")
// const { join } = require('path'); // Import the join function from the path module
const path =require("path")
const productController=require("../controllers/productController")
const Categories=require("../models/categoryModel")
const session=require("express-session")
const config=require("../config/config")
const flash = require('express-flash');
adminRoute.use(flash());

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

adminRoute.get("/",adminAuth.isLogin,adminController.loadLogin)
adminRoute.post("/login",adminAuth.isLogin,adminController.verifyLogin)

//dashboard
adminRoute.post("/dashboard",adminAuth.verify,adminController.loadDashboard);
adminRoute.get("/dashboard",adminAuth.verify,adminController.loadDashboard);

// All user
adminRoute.get("/alluser",adminAuth.verify,adminController.loadAlluser)

//Admin status
adminRoute.get("/alluserlist",adminAuth.verify,adminController.listUnlistUser)

//All product
adminRoute.get('/allproduct',adminAuth.verify,adminController.loadAllproduct)
//product Status
adminRoute.get("/productlist",adminAuth.verify,productController.listunlistProduct)
adminRoute.get("/addproduct",adminAuth.verify,adminController.addproductCategory)

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




//Loaad editProduct
adminRoute.get("/editproduct",adminAuth.verify, productController.loadEditProduct)
adminRoute.post('/editproduct/:id', upload.array('image', 5), productController.handleEditProduct);
adminRoute.get('/deleteimage',adminAuth.verify,productController.deleteimage)
adminRoute.get("/deleteproduct",adminAuth.verify,productController.productDelete)


//load Category
adminRoute.get("/category",adminAuth.verify,adminController.loadCategory)
adminRoute.get("/addcategory",adminAuth.verify,adminController.loadAddCategory)
//insert Category
adminRoute.post("/addcategory",adminAuth.verify,adminController.insertCategory)
//category status
adminRoute.get("/listcategory",adminAuth.verify, adminController.listUnlistCategory);
//edit category
adminRoute.get("/editcategory",adminAuth.verify,adminController.loadEditCategory)
adminRoute.post('/editcategory',adminAuth.verify, adminController.updateCategory);
//deleteCategory
adminRoute.get("/deletecategory",adminAuth.verify,adminController.deleteCategory)




//Logout
adminRoute.get("/logout",adminController.adminLogout)
adminRoute.get("*",(req,res)=>{
    res.redirect('/admin')
  })
 


module.exports=adminRoute