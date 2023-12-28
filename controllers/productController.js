const express=require("express")
const productController=express()
const multer=require('multer')
const path=require("path")
const Products=require("../models/productModel")
const User= require("../models/userModel")
const Category = require("../models/categoryModel")
const fs = require('fs/promises')


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


const productActive = async (req, res) => {
    try {
        const productId = req.params.id; 
        const check = await Products.findByIdAndUpdate({ _id: productId }, { status: "Active" });
        const status = check.status;
        res.json({ status: status });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
};

const productBlock = async (req, res) => {
    try {
        const productId = req.params.id; 
        const check = await Products.findByIdAndUpdate(
            { _id: productId },
            { status: "Block" },
            { new: true }
        );
        const status = check.status;
        res.json({ status: status });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
};

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





module.exports={insertProduct,productActive,productBlock,loadEditProduct}