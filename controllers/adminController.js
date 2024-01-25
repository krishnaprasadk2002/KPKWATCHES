const User = require("../models/userModel");
const Products=require("../models/productModel")
const category=require ("../models/categoryModel")
const bcrypt = require("bcrypt");
const Category = require("../models/categoryModel");

const loadLogin = async (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        console.log(error.message);
    }
};

const verifyLogin = (req, res) => {
    try {
        const email = process.env.adminEmail;
        const password = process.env.adminPassword;
        const name = process.env.adminName;

        if (email == req.body.email && password == req.body.password) {
            req.session.admin = name;
            res.redirect("/admin/dashboard");
        } else {
            const errormsg = "Admin not found";
            req.flash("err", errormsg);
            res.redirect("/admin");
          }
        } catch (error) {
          console.log(error.message);
        }
      };

 
const loadDashboard = async (req, res) => {
   try {
    res.render("dashboard")
   } catch (error) {
    console.log(error.message);
   }
};

const loadAlluser=async(req,res)=>{
    try {
        const userData=await User.find({is_verified:1})
        res.render('alluser',{userData});
    } catch (error) {
        console.log(error.message);
    }
}

const listUnlistUser=async (req,res)=>{
    try {
        const id=req.query.id
        const user = await User.findOne({_id:id})
        if(user){
            const newStatus=user.status === "Active" ? "Block" : "Active";
            const updatedUser=await User.findByIdAndUpdate(id,{$set:{status:newStatus}},{new:true})
            const alluser=await User.find();
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.redirect("/admin/alluser")
        }else{
            res.send("listing and unlisting")
        }
        }catch (error) {
        console.log(error.message);
    }
}

const adminLogout=async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}




//======================================================================================Admin DashBoard ==========================================================================



module.exports = { 
      loadLogin,
      verifyLogin,
      loadDashboard,
      loadAlluser,
      listUnlistUser,
      adminLogout,
    };
