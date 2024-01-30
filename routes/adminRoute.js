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
// const flash = require('express-flash');
const flash = require('connect-flash');


adminRoute.use(session({secret: config.sessionSecret,
    resave: false, 
    saveUninitialized: true  
  }));
  adminRoute.use(flash());

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





//===================================================================product controller=========================================================

//All product
adminRoute.get('/allproduct',adminAuth.verify,productController.loadAllproduct)
//product Status
adminRoute.get("/productlist",adminAuth.verify,productController.listunlistProduct)
adminRoute.get("/addproduct",adminAuth.verify,productController.addproductCategory)

//Add product
adminRoute.get('/addproduct',productController.loadAddproducts)
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

//===================================================================================category Controller=============================================================
const categoryController=require("../controllers/categoryController")

//load Category
adminRoute.get("/category",adminAuth.verify,categoryController.loadCategory)
adminRoute.get("/addcategory",adminAuth.verify,categoryController.loadAddCategory)
//insert Category
adminRoute.post("/addcategory",adminAuth.verify,categoryController.insertCategory)
//category status
adminRoute.get("/listcategory",adminAuth.verify, categoryController.listUnlistCategory);
//edit category
adminRoute.get("/editcategory",adminAuth.verify,categoryController.loadEditCategory)
adminRoute.post('/editcategory',adminAuth.verify, categoryController.updateCategory);
//deleteCategory
adminRoute.get("/deletecategory",adminAuth.verify,categoryController.deleteCategory)


//===========================================Order ===============================

const orderController=require("../controllers/orderController")

adminRoute.get("/orders",adminAuth.verify,orderController.loadOrder)
adminRoute.put('/updateStatus/:orderId',adminAuth.verify,orderController.changeStatus)

//=====================================Coupon Controller ==============================
const couponController=require("../controllers/couponController")

adminRoute.get("/coupon",adminAuth.verify,couponController.loadCoupan)
adminRoute.get("/addcoupon",adminAuth.verify,couponController.loadAddCoupon)
adminRoute.post("/addcoupon",adminAuth.verify,couponController.addCouponDetails)
adminRoute.get("/editcoupon",adminAuth.verify,couponController.loadEditCoupon)
adminRoute.post("/editcoupon",adminAuth.verify,couponController.editCoupon)
adminRoute.delete('/deleteCoupon/:id',adminAuth.verify,couponController.deleteCoupon)

//===============================================================================Banner Mangement===============================================
const bannerController=require("../controllers/bannerController")

adminRoute.get("/banner",adminAuth.verify,bannerController.loadBanner)
adminRoute.get("/addbanner",bannerController.addBanner)

const bannerStorage=multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,path.join(__dirname, '../public/uploads'))
  },
  filename:function(req,file,cb){
    const currentDate=new Date();
    const formattedDate= currentDate.toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const name = formattedDate + '_' + file.originalname;
    cb(null, name);
  },
  })
  const Bannerupload = multer({ storage: bannerStorage })
adminRoute.post("/addbanner",Bannerupload.single('image'),bannerController.addBannerDetails)
adminRoute.get('/editbanner',adminAuth.verify,bannerController.editBanner)
adminRoute.post("/editbanner/:id", Bannerupload.single('image'), bannerController.editBannerDetails);
adminRoute.delete('/deleteimage',adminAuth.verify, bannerController.editImageDelete);
adminRoute.get("/bannerstatus",adminAuth.verify,bannerController.bannerStatus)
adminRoute.get("/deletebanner",adminAuth.verify,bannerController.bannerDelete)

//sales report
adminRoute.get("/salesreport",adminAuth.verify,adminController.salesReport)
adminRoute.post("/datesort",adminAuth.verify,adminController.dateSort)

//=-=======================================Offers=================================
const offerController = require("../controllers/offerController")

adminRoute.get("/offer",adminAuth.verify,offerController.loadOffer)
adminRoute.get("/addoffer",adminAuth.verify,offerController.loadAddOffer)
adminRoute.post("/addoffer",adminAuth.verify,offerController.addOfferDetails)
adminRoute.get("/editoffer",offerController.loadEditOffer)
adminRoute.post("/editoffer",offerController.editOfferDetails)
adminRoute.get("/statusoffer",offerController.statusOffer)
adminRoute.delete("/deleteoffer",offerController.deletingOffer)


// ======================================================================
//Logout
adminRoute.get("/logout",adminController.adminLogout)

adminRoute.get("*",(req,res)=>{
    res.redirect('/admin')
  })
 

module.exports=adminRoute