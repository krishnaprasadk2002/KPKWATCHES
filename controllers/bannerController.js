const User=require("../models/userModel")
const Banner =require("../models/bannerModal")
const sharp=require("sharp")
const path=require("path")
const { log } = require("console")

const loadBanner = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;


        const totalBanners = await Banner.countDocuments();
        const totalPages = Math.ceil(totalBanners / limit);

        const bannerData = await Banner.find()
            .skip((page - 1) * limit)
            .limit(limit);

        res.render("banner", {
            bannerData,
            limit,
            currentPage: page,
            totalPages: totalPages,
        });
    } catch (error) {
       res.redirect("/500")
    }
};


const addBanner=async(req,res)=>{
    try {
        res.render("addBanner")
    } catch (error) {
       res.redirect("/500")
    }
}

const addBannerDetails = async (req, res) => {
    try {
        const image = req.file.filename;
        const { title, description, location } = req.body;

        const newBanner = new Banner({
            title,
            description,
            location,
            image: image
        });

        await newBanner.save();

        const promises = [image].map(async (filename) => {
            const originalImagePath = path.join(__dirname, '../public/uploads', filename);
            const resizedPath = path.join(__dirname, '../public/uploads', 'resized_Banner' + filename);

            await sharp(originalImagePath)
                .resize(1920, 900)
                .toFile(resizedPath);
        });

        await Promise.all(promises);

    } catch (error) {
       res.redirect("/500")
        res.status(500).send("Internal Server Error");
    }
};


// Load Edit banner
const editBanner = async (req, res) => {
    try {
        const bannerId = req.query.id;
        const banner = await Banner.findById(bannerId);
        console.log(banner);
        res.render("editbanner", { banner });
    } catch (error) {
       res.redirect("/500")
        res.status(500).send("Internal Server Error");
    }
};

//Edit banner details

const editBannerDetails = async (req, res) => {
    try {
        const bannerId = req.params.id;
        const { title, description, location } = req.body;
        const image = req.file ? req.file.filename : null;
       console.log(req.file);

        const existingBanner = await Banner.findById(bannerId);

        if (!existingBanner) {
            return res.status(404).send('Banner not found');
        }

        if (image) {
            // If a new image is provided, process and update it
            const originalImagePath = path.join(__dirname, '../public/uploads', image);
            const resizedPath = path.join(__dirname, '../public/uploads', `resized_${image}`);

            await sharp(originalImagePath)
            .resize(1920, 900)
            .toFile(resizedPath);
            existingBanner.image = [];
            existingBanner.image.push(`resized_${image}`);
        }
        

        // Update other banner details
        existingBanner.title = title;
        existingBanner.description = description;
        existingBanner.location = location;

        // Save the updated banner
        await existingBanner.save();
        res.redirect("/admin/banner");
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const editImageDelete = async (req, res) => {
    try {
        console.log("query data",req.query.image);
        console.log("quer",req.query.bannerId);
        const banner = await Banner.findOne({_id:req.query.bannerId});
        

        if (!banner) {
            return res.status(404).send('Banner not found');
        }

        const imageToDelete = req.query.image;
        console.log("image id",imageToDelete);

        // // Optionally 
        // const imagePath = path.join(__dirname, '../public/uploads', imageToDelete);
        // fs.unlink(imagePath, (err) => {
        //     if (err) {
        //         console.error('Error deleting file:', error);
        //     } else {
        //         console.log('File deleted successfully');
        //     }
        // });

        await Banner.updateOne(
            { _id: req.query.bannerId },
            { $pull: { image: imageToDelete } }
        );

        res.json({success:true})
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};


//status true and false

const bannerStatus = async (req, res) => {
    try {
        const id = req.query.id;
        console.log(id)
        const banner = await Banner.findOne({ _id: id });
        console.log(banner)

        if (banner) {
            const newStatus = banner.status === true ? false : true;
            
            const updatedStatus = await Banner.findByIdAndUpdate(
                id,
                { $set: { status: newStatus } },
                { new: true }
            );

            res.redirect("/admin/banner");
        } else {
            res.status(404).json("Status changing failed");
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

//deleting the banner

const bannerDelete = async (req, res) => {
    try {
        const bannerId = req.query.id;
        const deleteBanner = await Banner.findByIdAndDelete(bannerId);

        if (deleteBanner) {
            res.status(200).json({ message: 'Banner deleted successfully' });
        } else {
            console.log("Banner not found or already deleted");
            res.status(404).json({ error: 'Banner not found or already deleted' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



module.exports={
    loadBanner,
    addBanner,
    addBannerDetails,
    editBanner,
    editBannerDetails,
    editImageDelete,
    bannerStatus,
    bannerDelete
}