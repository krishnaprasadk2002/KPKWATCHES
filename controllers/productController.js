const express=require("express")
const productController=express()
const multer=require('multer')
const path=require("path")
const Products=require("../models/productModel")
const User= require("../models/userModel")
const Categories = require("../models/categoryModel")
const sharp=require("sharp")
const upload = multer({ dest: '/public/uploads/' });

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
        const categories = await Categories.find(); 
        res.render("editproduct", { product, categories });
    } catch (error) {
        console.log(error.message);
    }
}

//edit product 
const handleEditProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, description, price, Category, quentity } = req.body;
        const images = req.files ? req.files.map(file => file.filename) : [];

        // Find the existing product by ID
        const existingProduct = await Products.findById(productId);

        if (!existingProduct) {
            return res.status(404).send('Product not found');
        }

        // Check if a new image is uploaded
        let imageData = [];
        if (images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                const originalImagePath = path.join(__dirname, '../public/uploads', images[i]);
                const resizedPath = path.join(__dirname, '../public/uploads', `resized_${images[i]}`); // Use a different filename for the resized image

                // Resize image using sharp
                await sharp(originalImagePath)
                    .resize(800, 1200, { fit: 'fill' })
                    .toFile(resizedPath);

                // Push the resized filename to the array
                imageData.push(`resized_${images[i]}`);
            }
        }

        // Update product details
        existingProduct.name = name;
        existingProduct.description = description;
        existingProduct.price = price;
        existingProduct.Category = Category;
        existingProduct.quentity = quentity;
        existingProduct.image = imageData.length > 0 ? imageData : existingProduct.image;

        // Save the updated product
        await existingProduct.save();

        res.status(200).send('Product updated successfully');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};


module.exports={insertProduct,listunlistProduct,loadEditProduct,handleEditProduct}