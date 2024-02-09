const Offer=require("../models/offerModel")
const Category=require("../models/categoryModel")
const Products=require("../models/productModel")



const loadOffer = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;

        const totalOffers = await Offer.countDocuments();
        const totalPages = Math.ceil(totalOffers / limit);

        const offerData = await Offer.find()
            .skip((page - 1) * limit)
            .limit(limit);

        res.render("Alloffer", {
            offerData,
            limit,
            currentPage: page,
            totalPages: totalPages,
        });
    } catch (error) {
      res.redirect("/500")
    }
};


const loadAddOffer = async(req,res)=>{
    try {
        res.render("addoffer")
    } catch (error) {
      res.redirect("/500")
    }
}

//addoffer details

const addOfferDetails = async (req, res) => {
    try {
        const { name, discount, startingDate, expiryDate } = req.body;

        const offerExist = await Offer.findOne({  name: { $regex: new RegExp("^" + name, 'i') }});

        if (offerExist) {
            return res.status(400).json({ error: 'Offer already added' });
        } else {
            const offer = new Offer({
                name,
                discount,
                startingDate,
                expiryDate,
            });
            await offer.save();
            return res.status(200).json({ message: 'Offer added successfully' });
        }
    } catch (error) {
        res.redirect("/500")
        return res.status(500).json({ error: 'Internal server error' });
    }
};

//Edit offers

const loadEditOffer = async (req,res)=>{
    try {
        const editoffer=req.query.id
        const offerData = await Offer.findById(editoffer)
        res.render("editOffer",{offerData})
    } catch (error) {
      res.redirect("/500")
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const editOfferDetails = async (req, res) => {
    try {
        const editOfferId = req.body.id;
        const { name, discount, startingDate, expiryDate } = req.body;

        const existOffer = await Offer.findOne({
            name: { $regex: new RegExp("^" + name, 'i') },
            _id: { $ne: editOfferId }
        });


        if (existOffer) {
            return res.status(400).json({ error: "Offer name already exists" });
        }

        const updateOffer = await Offer.findByIdAndUpdate(
            editOfferId,
            { name: name, discount: discount, startingDate: startingDate, expiryDate: expiryDate },
            { new: true }
        );

        if (!updateOffer) {
            return res.status(400).json({ error: "Offer not found" });
        }

        res.status(200).json({ success: true, message: "Offer edited successfully" });
    } catch (error) {
      res.redirect("/500")
        return res.status(500).json({ error: 'Internal server error' });
    }
};

//status changing

const statusOffer = async (req,res)=>{
    try {
        const statusId = req.query.id
        // console.log("status",statusId);
        const status=await Offer.findOne({_id:statusId})

        if(status){
            const newstatus = status.status === true ? false : true;

            const updateStatus = await Offer.findByIdAndUpdate(statusId,{$set:{status:newstatus}},{new:true})
            res.redirect("/admin/offer")
        }else{
            res.status(404).json({error:"status not found"})
        }

    } catch (error) {
        res.redirect("/500")
        res.status(500).send("Internal Server Error");
    }
} 

//deleting offer

const deletingOffer = async (req,res)=>{
    try {
        const offerId = req.query.id
        // console.log("offer",offerId);
        const deleteOffer = await Offer.findByIdAndDelete(offerId)

        if(deleteOffer){
            res.status(200).json({message:"deleted successfully"})
        }else{
            res.status(404).json({error:"offer not found"})
        }
    } catch (error) {
        res.redirect("/500")
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const applyCategoryOffer= async (req,res)=>{
    try {
        const {categoryId,offerId} = req.body
        await Category.updateOne({_id:categoryId},
            {$set:{offer:offerId}
        })
        res.json({success:true})
    } catch (error) {
      res.redirect("/500")
    }
}

const removeCategoryOffer = async (req,res)=>{
    try {

        const  { categoryId } = req.body

        await Category.updateOne({_id:categoryId},
            {$unset:{offer:1}
        },
        await Products.updateMany(
            { category: categoryId },
            { $unset: {offerprice: 1 } 
        }))
        
            res.json({ success: true });
    } catch (error) {
      res.redirect("/500")
    }
}

const applyProductOffer = async (req,res)=>{
    try {
        const {offerId,productId}=req.body

        await Products.updateOne({_id:productId},
            {$set:{offer:offerId}
        })
        res.json({success:true})
    } catch (error) {
      res.redirect("/500")
    }
}

const removeProductOffer = async (req,res)=>{
    try {
        const {productId} = req.body
        await Products.updateOne({_id:productId},
            {$unset:{offer:1,offerprice:1}
        })
        res.json({success:true})
    } catch (error) {
      res.redirect("/500")
    }
}

module.exports={
    loadOffer,
    loadAddOffer,
    addOfferDetails,
    loadEditOffer,
    editOfferDetails,
    statusOffer,
    deletingOffer,
    applyCategoryOffer,
    removeCategoryOffer,
    applyProductOffer,
    removeProductOffer


}