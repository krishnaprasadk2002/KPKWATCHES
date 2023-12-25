const express=require("express")
const productController=express()
const multer=require('multer')
const path=require("path")
const Products=require("../models/productModel")



const insertProduct = async (req, res) => {
    try {
        // Access uploaded files via req.files
        const images = req.files.map(file => file.filename);

        // Access other form fields via req.body
        const { name, description, price, offerprice, Category, status, quentity, date } = req.body;

        // Create a new product instance with the received data
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

        // Save the product to the database
        await newProduct.save();

        res.status(200).send("Product added successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports={insertProduct}