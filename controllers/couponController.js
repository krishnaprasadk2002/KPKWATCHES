const Orders=require("../models/orderModel")
const Cart=require("../models/cartModel")
const Coupon=require("../models/couponModel")


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

const addCouponDetails=async(req,res)=>{
    try {
        const {name,code,min,discount,description,expiryDate}=req.body
        const addCoupon = new Coupon({
            couponName: name,
            couponCode: code,
            minAmount: min,
            discountAmount: discount,
            couponDescription: description,
            expiryDate: expiryDate
        });
        
        await addCoupon.save()

        res.redirect("/admin/coupon")
    } catch (error) {
        console.log(error.message)
    }
}

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
  loadCoupan,
  loadAddCoupon,
  addCouponDetails,
  deleteCoupon

}