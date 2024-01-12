const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Products=require("../models/productModel")
const category=require("../models/categoryModel")
const userOtpVerification = require("../models/otpModel")
const nodemailer = require("nodemailer");
const Category = require("../models/categoryModel");
const Orders = require("../models/orderModel");



const loadRegister = async (req, res) => {
  try {
    res.render('registeration');
  } catch (error) {
    console.log(error.message);
  }
}

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
}

const insertUser = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const errorMessage = 'Email already exists. Please choose a different email.';
      return res.render('registeration', { errorMessage });
    }

    const spassword = await securePassword(password);
    const user = new User({
      name,
      mobile,
      email,
      password: spassword,
      is_admin: 0,
    });

    const userData = await user.save();


    sendOTPverificationEmail(userData, res);

  } catch (error) {
    console.log(error.message);
  }
};

// otp verificaton 

const sendOTPverificationEmail = async ({ email }, res) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'prasadkrishna1189@gmail.com',
        pass: 'vglm kbwh kqpt zbdg'
      }
    });
    otp = `${Math.floor(1000 + Math.random() * 9000)
      }`

    // mail options
    const mailOptions = {
      from: 'prasadkrishna1189@gmail.com',
      to: email,
      subject: "Verify Your email",
      html: `Your OTP is: ${otp}`
    };

    // hash the otp
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);

    const newOtpVerification = await new userOtpVerification({ email: email, otp: hashedOTP });
    console.log(newOtpVerification)
    // save otp record
    await newOtpVerification.save();
    await transporter.sendMail(mailOptions);

    res.redirect(`/otp?email=${email}`);

  } catch (error) {
    console.log(error.message);
  }
}

//otp load

const loadotp = async (req, res) => {
  try {
    const email = req.query.email
    console.log(email);
    res.render("otp", { email })
  } catch (error) {
    console.log(error.message)
  }
}

const verifyOtp = async (req, res) => {
  try {
    const email = req.body.email;
    console.log('email', req.body.email);
    const otp = req.body.Otp;

    const userVerification = await userOtpVerification.findOne({ email: req.body.email });
    console.log('userVerification:', userVerification);

    if (!userVerification) {
      console.log("otp expired");
      res.redirect('/register?failed=otp verifcation failed. Please try again.');
      return;
    }

    const { otp: hashedOtp } = userVerification;
    console.log('hashedOtp:', hashedOtp);

    const validOtp = await bcrypt.compare(otp, hashedOtp);
    console.log('validOtp:', validOtp);

    if (validOtp) {
      const userData = await User.findOne({ email });
      if (userData) {
        await User.findByIdAndUpdate(userData._id, {
          $set: {
            is_verified:1
          }
        });
      }

      // delete the OTP record
      await userOtpVerification.deleteOne({ email });


      res.redirect('/login?success=Registration successful!');
    } else {
      res.redirect('/register?failed=Registration failed. Please try again.');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};

//Resend otp

const resendOtp = async (req, res) => {
  try {

      const userEmail = req.query.email;
      await userOtpVerification.deleteMany({email: userEmail});
      console.log(userOtpVerification)
      console.log("User Email:", userEmail);
      if (userEmail) {
          sendOTPverificationEmail({
              email: userEmail
          }, res);
      } else {

          console.log("User email not provided in the query");

      }

  } catch (error) {
      console.log(error);

  }
} 

// login page

const loginLoad = async (req, res) => {
  try {
    let message 
    res.render('login',{message});
  } catch (error) {
    console.log(error.message);
  }
}


const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.status === 'Active' && userData.is_verified == 1) {
          
          if (req.session) {
            req.session.user_id = userData;
            return res.redirect('/');
          } else {
            console.error('req.session is undefined');
            return res.status(500).send('Internal Server Error');
          }
        } else {
          req.flash('er','User Have blocked ' )
      // User not found
      return res.render('login', { message:req.flash('er')});
        }
      } else {
        req.flash('er','Incorrect username and password' )
      // User not found
      return res.render('login', { message:req.flash('er')});
      }
    } else {
      req.flash('er','please signup your not an user' )
      // User not found
      return res.render('login', { message:req.flash('er')});
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};



// const loadHome = async (req, res) => {
  
//   try {
   
//     const username = req.session.user_id;
//     const productData = await Products.find({ is_listed: { $ne: "Unlisted" } }).populate('category').exec();
//       // const categories=await Category.find({is_listed:"Listed"})
//       const filteredProducts = productData.filter((product) => product.category.is_listed !== "Unlisted");
//     if (req.session.user_id ) {
//       const checkUser=await User.findOne({_id:req.session.user_id,status:"Block"})
//       if(checkUser){
//         req.session.user_id=null
//       }
//       res.render("home", { username,filteredProducts });
//       // res.render("home", { username,productData:productData,Category:categories });
//     } else {
//       res.render("home",{filteredProducts})
//       // res.render("home", { productData:productData,Category:categories });
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// }

const loadHome = async (req, res) => {
  try {
    const username = req.session.user_id;
    const productData = await Products.find({ is_listed: { $ne: "Unlisted" } }).populate('category').exec();
    const filteredProducts = productData.filter((product) => product.category.is_listed !== "Unlisted");

    // Always check for a blocked user
    const checkUser = await User.findOne({ _id: req.session.user_id, status: "Block" });
    if (checkUser) {
      req.session.user_id = null;
    }

    // Render the home page
    if (req.session.user_id) {
      res.render("home", { username, filteredProducts });
    } else {
      res.render("home", { filteredProducts });
    }
  } catch (error) {
    console.log(error.message);
  }
}


const loadProduct = async (req, res) => {
  try {
      const selectedCategory = req.query.category;
      let productss;

      if (selectedCategory) {
          const category = await Category.findById(selectedCategory);

          if (category && category.is_listed) {
              const products = await Products.find({ category: selectedCategory, is_listed: "Listed" }).populate('category').exec();
              res.render("allproduct", { filteredProducts: products, allcategory: [] }); // Pass products directly to the view
              return; // End the function to prevent further execution
          } else {
              productss = [];
          }
      } else {
          const listedCategoryIds = (await Category.find({ is_listed: "Listed" })).map(category => category._id);
          productss = await Products.find({
              'category': { $in: listedCategoryIds },
              is_listed: "Listed"
          }).populate('category');
      }

      const productData = await Products.find({ is_listed: { $ne: "Unlisted" } }).populate('category').exec();
      const filteredProducts = productData.filter((product) => product.category.is_listed !== "Unlisted");
      const allcategory = await Category.find({ is_listed: "Listed" });

      res.render("allproduct", { filteredProducts, allcategory });
  } catch (error) {
      console.log(error.message);
  }
};



const userLogout = async (req, res) => {
  try {
    req.session.destroy()
    res.redirect("/")
  } catch (error) {
    console.log(error.message);
  }
}


//===========================================================================User Profile===============================================================================

//Load Userprofile

const userProfile = async (req, res) => {
  try {
    const userId = req.session.user_id;

    // if (!userId) {
    //   res.redirect("/")
    // }

    const user = await User.findById(userId);
    const orders = await Orders.find({ user: userId })
      .populate({
        path: "Products.productId",
        model: "Products", 
      })
      .exec();

    console.log(orders);
    res.render("userprofile", { user, orders });
  } catch (error) {
    console.log(error.message);
  }
};



// Edit Address

const editAddress=async (req,res)=>{
  try {
    const userId=req.session.user_id
    const user = await User.findById(userId)

    if(!user){
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const specificaddress = user.address.find((add) => add.address === req.body.address);
    console.log(specificaddress);
    if(specificaddress){
      specificaddress.name=req.body.name
      specificaddress.mobile=req.body.mobile
      specificaddress.pincode=req.body.pincode
      specificaddress.address=req.body.address
      specificaddress.city=req.body.city
      specificaddress.state=req.body.state

      console.log('userId:', userId);
      console.log(user.address);
      
      try {
        await User.findByIdAndUpdate({ email: req.session.email, 'address.address': req.body.address },
          
          {
            $set: {
              'address.$.name': req.body.name,
              'address.$.mobile': req.body.mobile,
              'address.$.pincode': req.body.pincode,
              'address.$.address': req.body.address,
              'address.$.city': req.body.city,
              'address.$.state': req.body.state,
            },
          }
        );
          console.log('Address updated successfully');
        res.status(200).json({ message: 'Address updated successfully' });
      } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    } else {
      console.log('Specific address not found');
      // Handle the case where the specific address is not found
      res.status(404).json({ message: 'Specific address not found' });
    }
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


//Edit profile

const editProfile=async (req,res)=>{
  try {
    const userId=req.session.user_id
    const user=await User.findById(userId)

    if(!user){
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name=req.body.name
    user.mobile=req.body.mobile

    await user.save()
    return res.status(200).json({ success: true, message: 'Form submitted successfully' });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

//Change password

const changePassword=async (req,res)=>{
  const userId=req.session.user_id
  const currentPassword=req.body.currentpassword
  const newPassword=req.body.newpassword
  const confirmNewPassword=req.body.confirmnewpassword

  try {
    const user=await User.findById(userId)
    if(!user){
      return res.status(404).json({ error: 'User not found' });
    }

    if(currentPassword){
      const passwordMatch=await bcrypt.compare(currentPassword,user.password)
      if(!currentPassword){
        return res.json({ message: 'Current password is incorrect' });
      }
    }

    if(newPassword !== confirmNewPassword){
      return res.json({ message: 'New password and confirm password do not match' });
    }

      // Update the user's password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = hashedPassword;

      await user.save()

      return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: 'Internal server error' })
  }
}



//Remove address

const removeAddress = async (req, res) => {
  try {
      const userId = req.session.user_id;
      const addressId = req.params.id;
      const user = await User.findById(userId);

      user.address.pull({ _id: addressId });
      await user.save();

      // Send a success response to the client
      res.status(200).json({ message: 'Address removed successfully' });
  } catch (error) {
      console.log(error);
      // Send an error response to the client
      res.status(500).json({ error: 'Internal Server Error' });
  }
};





module.exports = {
  loadRegister,
  insertUser,
  loadotp,
  verifyOtp,
  resendOtp,
  loginLoad,
  verifyLogin,
  loadHome,
  loadProduct,
  userLogout,
  userProfile,
  editProfile,
  changePassword,
  removeAddress,
  editAddress
}
