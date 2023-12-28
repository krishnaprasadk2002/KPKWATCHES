const User = require("../models/userModel");
const Products=require("../models/productModel")
const category=require ("../models/categoryModel")
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
        const userData=await User.find({is_verified:1})
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

//load addproduct
const loadAddproducts=async(req,res)=>{
    try {
        res.render("addproduct")
    } catch (error) {
        console.log(error.message);
    }
}



//loadCategory

const loadCategory=async (req,res)=>{
    try {
        const categoryData=await category.find()
        res.render("category",{categoryData})
    } catch (error) {
        console.log(error.message);
    }
}

const loadAddCategory=async(req,res)=>{
    try {
        res.render("addcategory")
    } catch (error) {
        console.log(error.message);
    }
}

const insertCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const existingCategory = await category.findOne({ name });
        if (existingCategory) {
            return res.status(400).send("Category with the same name already exists");
        }
        const newCategory = new category({
            name,
            description,
        });
        await newCategory.save();
        res.status(200).send("Category added successfully");
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const activeCategory = async (req,res)=>{
    try {
        const categoryId=req.params.id
        const check =await category.findByIdAndUpdate({_id:categoryId},{status:"Active"})
        const status=check.status;
        res.json({status:status})

    } catch (error) {
        console.log(error.message)
    }
}

const blockCategory = async (req,res)=>{
    try {
        const categoryId=req.params.id
        const check=await category.findByIdAndUpdate({_id:categoryId},{status:"Block"},{new:true})
        const status=check.status;
        res.json({status:status})

    } catch (error) {
        console.log(error.message);
    }
}

// Edit category load

const loadEditCategory = async (req, res) => {
    try {
        const categoryId = req.query.id;
        const Category = await category.findById(categoryId);  
        res.render("editcategory", { Category });
    } catch (error) {
        console.log(error.message);
    }
}

//Updating category 

const updateCategory = async (req, res) => {
    try {
        const categoryId = req.body.id;  
        const { name, description } = req.body;

        const existingCategory = await category.findOne({ name: { $regex: new RegExp("^" + name + "$", "i") }, _id: { $ne: categoryId } });
        if (existingCategory) {
            return res.send("Category name already exists")
        }
        // Update the category
        const updatedCategory = await category.findByIdAndUpdate(categoryId, { name, description }, { new: true });
        if (!updatedCategory) {
            console.log("Category not found");
        }
        res.redirect("/admin/category");
    } catch (error) {
        console.log(error.message);
        res.send("Category name already exists")
    }
};





const adminLogout=async(req,res)=>{
    try {
        res.session.destroy()
    } catch (error) {
        console.log(error.message);
    }
}





module.exports = { 
      loadLogin,
      verifyLogin,
      loadDashboard,
      loadAlluser,
      activeUser,
      blockUser,
      loadAllproduct,
      loadAddproducts,
      loadCategory,
      loadAddCategory,
      insertCategory,
      activeCategory,
      blockCategory,
      loadEditCategory,
      updateCategory,
      adminLogout
    };
