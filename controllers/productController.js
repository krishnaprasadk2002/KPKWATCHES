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


const productList = async (req, res) => {
    try {
        const productId = req.params.id; 
        const check = await Products.findByIdAndUpdate(
            { _id: productId },
            { is_listed: true }, 
            { new: true }
        );
        const is_listed = check.is_listed;
        res.json({ is_listed: is_listed });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
};

const productUnlist = async (req, res) => {
    try {
        const productId = req.params.id; 
        const check = await Products.findByIdAndUpdate(
            { _id: productId },
            { is_listed: false }, 
            { new: true }
        );
        const is_listed = check.is_listed;
        res.json({ is_listed: is_listed });
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

const editProduct = async (req, res) => {
    try {
        const productId = req.body.id;
        const { name, description, price, offerprice, Category, quentity, deletedImageIds } = req.body;

        // Find the product by ID
        const updatedProduct = await Products.findByIdAndUpdate(productId, {
            $set: { name, description, price, offerprice, Category, quentity }
        }, { new: true });

        // Handle deleted images
        const arrImages = [];

        if (req.files && req.files.length > 0) {
            // Process and add new images
            for (let i = 0; i < req.files.length; i++) {
                const outputPath = path.resolve(__dirname, '..', 'public', 'uploads', req.files[i].filename);
                await sharp(req.files[i].path).resize({ width: 500, height: 500 }).toFile(outputPath);
                arrImages.push(req.files[i].filename);
            }
        }

        // Add existing images (excluding deleted ones)
        arrImages.push(...updatedProduct.image.filter(image => !deletedImageIds.includes(`${productId}_${image}`)));

        // Update the product with the new set of images
        updatedProduct.image = arrImages;
        await updatedProduct.save();

        res.redirect("/admin/allproducts");
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};





module.exports={insertProduct,productList,productUnlist,loadEditProduct,editProduct}