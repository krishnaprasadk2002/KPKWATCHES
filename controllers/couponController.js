const Orders=require("../models/orderModel")
const Cart=require("../models/cartModel")
const Coupon=require("../models/couponModel")
const Products=require("../models/productModel")

  

const applyCoupon = async (req, res) => {
  try {
      const userId = req.session.user_id;
      const { couponCode } = req.body;

      const currentDate = new Date();
      const cartData = await Cart.findOne({ userid: userId }).populate({
          path: "products.productId",
          model: "Products",
      });

      const totalPriceTotal = cartData.products.reduce((total, product) => {
          return total + product.totalPrice;
      }, 0);

     
      const coupon = await Coupon.findOne({
        couponCode,
        expiryDate: { $gte: currentDate },
        minAmount: { $lte: totalPriceTotal },
        "userUsed.used": { $ne: true }
    });
    
    if (coupon) {
        const alreadyUsed = coupon.userUsed.some((user) => user.userid.toString() === userId && user.used === true);
    
        if (!alreadyUsed) {
            const discount = totalPriceTotal - coupon.discountAmount;
    
            res.json({ success: `${coupon.couponName} added`, totalPriceTotal, discount });
        } else {
            res.json({ already: 'Coupon already used by this user' });
        }
    } else {
        res.json({ error: 'Coupon not found or not applicable' });
    }
    
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

//====================================================coupon admin side====================================================


const loadCoupan=async(req,res)=>{
    try {
        const admin=req.session.admin
        const coupons =await Coupon.find()
        res.render("coupon",{admin,coupons})
    } catch (error) {
        console.log(error.message)
    }
}

const loadAddCoupon = async(req,res)=>{
    try {
        const admin=req.session.admin
        res.render("addCoupon",{admin})
    } catch (error) {
        console.log(error.message);
    }
}
const addCouponDetails = async (req, res) => {
    try {
        const { name, code, min, discount, description, expiryDate } = req.body;

     
        const existingCouponByName = await Coupon.findOne({ couponName: new RegExp('^' + name + '$', 'i') });
        if (existingCouponByName) {
            req.flash('error', 'Coupon with the same name already exists.');
            return res.redirect("/admin/coupon");
        }

        
        const existingCouponByCode = await Coupon.findOne({ couponCode: new RegExp('^' + code + '$', 'i') });
        if (existingCouponByCode) {
            req.flash('error', 'Coupon with the same code already exists.');
            return res.redirect("/admin/addcoupon");
        }

        const addCoupon = new Coupon({
            couponName: name,
            couponCode: code,
            minAmount: min,
            discountAmount: discount,
            couponDescription: description,
            expiryDate: expiryDate
        });

        // Save the new coupon
        await addCoupon.save();

        req.flash('success', 'Coupon added successfully.');
        res.redirect("/admin/coupon");
    } catch (error) {
        console.error(error.message);
        req.flash('error', 'Internal Server Error');
        res.redirect("/admin/addcoupon");
    }
};


//load editcoupon page

const loadEditCoupon=async (req,res)=>{
    try {
        const couponId=req.query.id
        const coupon=await Coupon.findById(couponId)
        console.log("coupon data:",coupon);
        res.render("editCoupon",{coupon})
    } catch (error) {
        console.log(error.message);
    }
}
//edit coupon
const editCoupon = async (req, res) => {
    try {
        const couponId = req.body.id; 
        const { name, code, min, discount, description, expiryDate } = req.body;

        const existingCoupon = await Coupon.findOne({
            couponCode: { $regex: new RegExp("^" + code + "$", "i") },
            _id: { $ne: couponId },
        });

        if (existingCoupon) {
            return res.status(400).json({ error: "Coupon name and code already exist" });
        }

        const updateCoupon = await Coupon.findByIdAndUpdate(
            couponId,
            { couponName: name, couponCode: code, minAmount: min, discountAmount: discount, couponDescription: description, expiryDate },
            { new: true }
        );

        if (!updateCoupon) {
            return res.status(404).json({ error: "Coupon not found" });
        }

        
        res.json({ success: true, message: 'Coupon edited successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const deleteCoupon = async(req,res)=>{
    try {
       const couponId=req.params.id
       const deleteCoupon=await Coupon.findByIdAndDelete(couponId);
       res.json({success:"deleted"})


    } catch (error) {
        console.log(error.message);
    }
}



module.exports={
  applyCoupon,
  loadCoupan,
  loadAddCoupon,
  addCouponDetails,
  loadEditCoupon,
  editCoupon,
  deleteCoupon

}