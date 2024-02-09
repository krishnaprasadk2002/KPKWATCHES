const User = require("../models/userModel");
const Products=require("../models/productModel")
const category=require ("../models/categoryModel")
const bcrypt = require("bcrypt");
const Category = require("../models/categoryModel");
const Offer = require("../models/offerModel")
const moment = require("moment")


//loadCategory

const loadCategory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8; 

        const totalCategories = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategories / limit);

        const categoryData = await Category.find()
            .populate('offer')
            .skip((page - 1) * limit)
            .limit(limit);

        const offer = await Offer.find({ status: true });

        res.render("category", { categoryData, offer, moment, totalPages, currentPage: page });
    } catch (error) {
        res.redirect("/500")
    }
};


const loadAddCategory=async(req,res)=>{
    try {
        res.render("addcategory")
    } catch (error) {
        res.redirect("/500")
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
        res.redirect("/admin/category")
    } catch (error) {
        res.redirect("/500")
        res.status(500).send("Internal Server Error");
    }
};

const listUnlistCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const category = await Category.findOne({ _id: id });

        if (category) {
            const newStatus = category.is_listed === "Listed" ? "Unlisted" : "Listed";
            await Category.findByIdAndUpdate(id, { $set: { is_listed: newStatus } });
            const allCategory = await Category.find();

            // Set caching headers
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            res.redirect('/admin/category'); 
        } else {
            res.send("Category not found");
        }
    } catch (error) {
        res.redirect("/500")
        res.status(500).send("Internal Server Error");
    }
};


// Edit category load

const loadEditCategory = async (req, res) => {
    try {
        const categoryId = req.query.id;
        const Category = await category.findById(categoryId);  
        res.render("editcategory", { Category });
    } catch (error) {
        res.redirect("/500")
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
        req.flash('success', 'category edited successful!');
        res.redirect("/admin/category");
    } catch (error) {
        res.redirect("/500")
        res.status(500).json({ error: "Internal server error" });
    }
};

//deleteing category

const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.query.id;
        const deletingCategory = await Category.findByIdAndDelete(categoryId);
        res.redirect('/admin/category'); 
    } catch (error) {
        res.redirect("/500")
        res.status(500).send('Internal Server Error');
    }
};


module.exports={
    loadCategory,
    loadAddCategory,
    insertCategory,
    listUnlistCategory,
    loadEditCategory,
    updateCategory,
    deleteCategory,
}