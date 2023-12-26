const User = require("../models/userModel");
const Products=require("../models/productModel")
const bcrypt = require("bcrypt");

const loadLogin = async (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        console.log(error.message);
    }
};

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_admin === 0) {
                    res.render('login', { message: "email and password incorrect" });
                } else {
                    req.session.user_id = userData.name;
                    // res.redirect("/admin/dashboard");
                    res.render("")
                }
            } else {
                res.render('login', { message: "Email and password incorrect" });
            }
        } else {
            res.render('login', { message: "Email and password incorrect" });
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
        const userData=await User.find()
        res.render('alluser',{userData});
    } catch (error) {
        console.log(error.message);
    }
}

const activeUser = async (req, res) => {
    try {
        const user_id = req.params.id;
        const check = await User.findByIdAndUpdate({ _id: user_id }, { status: "Active" });
        const status = check.status;
        res.json({ status: status });
    } catch (error) {
        console.log(error.message);
    }
};

const blockUser = async (req, res) => {
    try {
        const user_id = req.params.id;
        const check = await User.findByIdAndUpdate({ _id: user_id }, { status: "Block" });
        const status = check.status;
        res.json({ status: status });
    } catch (error) {
        console.log(error.message);
    }
};


const loadAllproduct=async(req,res)=>{
    try {
        const productData=await Products.find()
        res.render('allproduct',{productData})
    } catch (error) {
        console.log(error.message);
    }
}




const loadAddproducts=async(req,res)=>{
    try {
        res.render("addproduct")
    } catch (error) {
        console.log(error.message);
    }
}



const adminLogout=async(req,res)=>{
    try {
        res.session.destroy()
    } catch (error) {
        console.log(error.message);
    }
}





module.exports = { loadLogin, verifyLogin, loadDashboard,loadAlluser,activeUser,blockUser,loadAllproduct,loadAddproducts,adminLogout };
