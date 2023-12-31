const express=require("express")
const productController=express()
const multer=require('multer')
const path=require("path")
const Products=require("../models/productModel")
const User= require("../models/userModel")
const Category = require("../models/categoryModel")
const sharp=require("sharp")


const insertProduct = async (req, res) => {
    try {
        
        const images = req.files.map(file => file.filename);

       
        const { name, description, price, offerprice, Category, status, quentity, date } = req.body;

        const newProduct = new Products({
            name,
            description,
            price,
            offerprice,
            Category,
            status,
            quentity,
            date,
            image: images,
        });

       
        await newProduct.save();

        res.status(200).send("Product added successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};



//listing and unlisting Product

const listunlistProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Products.findOne({ _id: id });
        if (product) {
            const newStatus = product.is_listed === "Listed" ? "Unlisted" : "Listed";
            const updatedProduct = await Products.findByIdAndUpdate(id, { $set: { is_listed: newStatus } }, { new: true });
            const allProducts = await Products.find();
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            res.redirect("/admin/allproduct")
        } else {
            res.send("Unlisting failed");
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Internal Server Error");
    }
};


//Load edit product

const loadEditProduct = async (req, res) => {
    try {
        const productId = req.query.id; 
        const product = await Products.findById(productId);  
        const categories = await Category.find(); 
        res.render("editproduct", { product, categories });
    } catch (error) {
        console.log(error.message);
    }
}







module.exports={insertProduct,listunlistProduct,loadEditProduct}