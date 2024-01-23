const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Products = require("../models/productModel")
const category = require("../models/categoryModel")
const userOtpVerification = require("../models/otpModel")
const nodemailer = require("nodemailer");
const Category = require("../models/categoryModel");
const Orders = require("../models/orderModel");
const Token = require("../models/tokenModel")
const crypto = require("crypto")
const Wishlist = require("../models/WhishlistModel");
const Cart=require('../models/cartModel')
const WhishlistModel = require("../models/WhishlistModel");



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
    const delteUnverifiedUser = await User.deleteOne({ email: req.body.email, is_verified: 0 })

    if (delteUnverifiedUser) {
      console.log("Not entered Otp user Deleted");
    }
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
    const otp = req.flash('error')[0]
    res.render("otp", { email, otp })
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
      req.flash('error', 'Invalid OTP');
      res.redirect(`/otp?email=${email}`);
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
            is_verified: 1
          }
        });
      }

      // delete the OTP record
      await userOtpVerification.deleteOne({ email });


      res.redirect('/login?success=Registration successful!');
    } else {
      req.flash('error', 'Invalid OTP');
      res.redirect(`/otp?email=${email}`);
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
    await userOtpVerification.deleteMany({ email: userEmail });
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


//Forget password

const forgotpass = async (req, res) => {
  try {
    res.render("forgotpassword")
  } catch (error) {
    console.log(error.message);
  }
}

//reset password link

const sendResetPasslink = async (email, res) => {
  try {
    email = email
    const user = await User.findOne({ email: email })
    console.log("what user send restpass:", user);

    if (!user) {
      return res.status(400).send("user with given email doesn't exist");
    }

    let token = await Token.findOne({ userId: user._id })

    if (!token) {
      token = await new Token({ userId: user._id, token: crypto.randomBytes(32).toString("hex") }).save();
    }


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

    const resetpage = `http://localhost:4004/resetpassword/${user._id
      }/${token.token
      }`;

    const mailOptions = {
      from: 'prasadkrishna1189@gmail.com',
      to: email,
      subject: "Verify Your email",
      html: `Your link here to reset the password: ${resetpage}`
    };
    await transporter.sendMail(mailOptions)



  } catch (error) {
    console.log(error.message);
  }
}

//send resent password

const sentResetPass = async (req, res) => {
  try {
    const email = req.body.mail
    await sendResetPasslink(email, res)
    req.flash('success', 'we sented a reset password link');
    res.redirect("/login")
  } catch (error) {
    console.log(error.message);
  }
}

// reset password page link

const resetPage = async (req, res) => {
  try {
    const userId = req.params.userId
    const token = req.params.token

    console.log(" what i want", userId, token);
    const categories = await Category.find({ is_listed: "Listed" })

    res.render("resetPassword", {
      category: categories,
      userId,
      token
    })
  } catch (error) {
    console.log(error.message);
  }
}

//reset password

const resetPassword = async (req, res) => {
  try {
    const user = req.body.userId
    const userId = await User.findById(user)
    const { email } = userId

    const token = req.body.token
    console.log(userId);

    if (!userId) {
      return res.status(400).send("Invalid link or expired")
    }

    const tokenDoc = await Token.findOne({
      userId: userId._id,
      token: token
    })

    console.log("woking", token);

    if (!tokenDoc) {
      return res.status(400).send("Invalid link or expired")
    }

    let password = req.body.confirmpassword
    const spassword = await securePassword(password)
    console.log("this is the last step:", spassword);

    await User.updateOne({
      email: email
    },
      {
        $set: {
          password: spassword
        }
      })
    req.flash('success', 'successfully setted new password');
    res.redirect("/login")
  } catch (error) {
    console.log(error.message);
  }
}


// login page

const loginLoad = async (req, res) => {
  try {
    let message
    res.render('login', { message });
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
          req.flash('er', 'User Have blocked ')
          // User not found
          return res.render('login', { message: req.flash('er') });
        }
      } else {
        req.flash('er', 'Incorrect username and password')
        // User not found
        return res.render('login', { message: req.flash('er') });
      }
    } else {
      req.flash('er', 'please signup your not an user')
      // User not found
      return res.render('login', { message: req.flash('er') });
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
    const sortOption = req.query.sort

    let totalproducts = await Products.find({ is_listed: "Listed" }).count()
    let totalPages = Math.ceil(totalproducts / 12)
    let currentPage = parseInt(req.query.page, 10) || 1;
    const skip = (currentPage - 1) * 12



    let sort = {};
    if (sortOption === 'default') {
      sort = { date: -1 }
    }
    else if (sortOption === 'priceLowTohigh') {
      sort = { price: 1 }
    } else if (sortOption === '2') {
      sort = { price: -1 };
    } else if (sortOption === '3') {
      sort = { name: 1 };
    }


    const selectedCategory = req.query.category;
    let productss;

    if (selectedCategory) {
      const category = await Category.findById(selectedCategory);

      if (category && category.is_listed) {
        const products = await Products.find({ category: selectedCategory, is_listed: "Listed" }).populate('category')
          .sort(sort)
          .skip(skip)
          .limit(12)
          .exec();
        res.render("allproduct", { filteredProducts: products, allcategory: [], totalPages, currentPage, sortOption }); // Pass products directly to the view
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

    const productData = await Products.find({ is_listed: { $ne: "Unlisted" } }).populate('category')
      .sort(sort)
      .skip(skip)
      .limit(12)
      .exec();
    const filteredProducts = productData.filter((product) => product.category.is_listed !== "Unlisted");
    const allcategory = await Category.find({ is_listed: "Listed" });



    res.render("allproduct", { filteredProducts, allcategory, totalPages, currentPage, sortOption });
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

    if (!userId) {
      res.redirect("/")
    }

    const user = await User.findById(userId);
    const orders = await Orders.find({ user: userId })

      .populate({
        path: "Products.productId",
        model: "Products",
      })
      .exec();


    // console.log(orders);
    res.render("userprofile", { user, orders });
  } catch (error) {
    console.log(error.message);
  }
};

//Add address

const loadAddAddress = async (req, res) => {
  try {
    const user=req.session.user_id
    if(!user){
      res.redirect("/")
    }
    res.render('addaddress')
  } catch (error) {
    console.log(error.message);
  }
}
const addAddressProfile = async (req, res) => {
  try {
    const userId = req.session.user_id;
    // console.log(userId);
    const { name, mobile, pincode, address, city, state } = req.body;


    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    user.address.push({
      name,
      mobile,
      pincode,
      address,
      city,
      state
    });

    const updatedUser = await user.save();
    if (updatedUser) {
      res.redirect('user/profile');
    }

  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};

// Edit Address

const editAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { name, mobile, pincode, address, city, state } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, 'address._id': req.params.id },
      {
        $set: {
          'address.$.name': name,
          'address.$.mobile': mobile,
          'address.$.pincode': pincode,
          'address.$.address': address,
          'address.$.city': city,
          'address.$.state': state,
        },
      },
      { new: true }
    );
    if (updatedUser) {
      console.log('Address updated successfully');
      res.status(200).json({ success: true, message: 'Address updated successfully' });
    } else {
      console.log('User or address not found');
      res.status(404).json({ success: false, message: 'User or address not found' });
    }
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


// Edit profile

const editProfile = async (req, res) => {
  try {
    const userId = req.session.user_id
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name
    user.mobile = req.body.mobile

    await user.save()
    return res.status(200).json({ success: true, message: 'Form submitted successfully' });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

//Change password

const changePassword = async (req, res) => {
  const userId = req.session.user_id
  const currentPassword = req.body.currentpassword
  const newPassword = req.body.newpassword
  const confirmNewPassword = req.body.confirmnewpassword

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (currentPassword) {
      const passwordMatch = await bcrypt.compare(currentPassword, user.password)
      if (!passwordMatch) {
        return res.json({ message: 'Current password is incorrect' });
      }
    }

    if (newPassword !== confirmNewPassword) {
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


    res.status(200).json({ message: 'Address removed successfully' });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: 'Internal Server Error' });
  }
};


//===============================================================Wish list=================================================================

//Load whishlist
const loadWhishlist = async (req, res) => {
  try {
    const user=req.session.user_id
    const wishlist=await Wishlist.findOne({user:user._id}).populate({
      path:"products.productId",
      model:"Products"
    }).exec()

    res.render("wishlist",{wishlist})
  } catch (error) {
    console.log(error.message);
  }
}

//adding to wishlist

const addToWishlist = async (req, res) => {
  try {
    const productId = req.params.productid;
    const userId = req.session.user_id;

    const productToWishlist = await Products.findOne({ _id: productId });
    console.log('Product Data:', productToWishlist);
    const wishlist = await Wishlist.findOne({ user: userId });

    if (productToWishlist && userId) {
//product already wishlisted or not checking .some means uniquevalues checking............
      const isProductInWishlist = wishlist && wishlist.products.some(item => item.productId.equals(productId));

      if (isProductInWishlist) {
        res.status(400).json({ error: "Product is already in the wishlist." });
      } else {
        if (productToWishlist.name) {
          if (wishlist) {
            wishlist.products.push({
              productId: productId,
              name: productToWishlist.name,
              price: productToWishlist.offerprice,
              Image: productToWishlist.image[0],
            });
            await wishlist.save();
          }
          res.status(200).json({ message: "Product added to wishlist successfully." });
        } else {
          
          res.status(400).json({ error: "Product name is required." });
        }
      }
    } else {
      res.status(400).json({ error: "Invalid product or user." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

//remove the wishlisted item

const removeWishlist = async (req, res) => {
  try {
    const productId = req.body.productId;
    const user = req.session.user_id;

    const existingWishlist = await Wishlist.findOne({ user: user });

    if (!existingWishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    existingWishlist.products = existingWishlist.products.filter(
      (wishitem) => !wishitem.productId.equals(productId)
    );

    const updatedWishlist = await existingWishlist.save();

    res.json({
      success: true,
      message: "Product removed from the wishlist",
      updatedWishlist,
    });
  } catch (error) {
    console.error(error); // Log the error to the console for further analysis
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//wishlist add to cart

const wishAddToCart = async (req, res) => {
  try {
      const productId = req.params.productid;
      const userId = req.session.user_id;

      const productToCart = await Products.findOne({ _id: productId });
      const cart = await Cart.findOne({ userid: userId });

      if (productToCart && userId) {
          if (cart) {
              const existingProductIndex = cart.products.findIndex(
                  (item) => item.productId.toString() === productId
              );

              if (existingProductIndex !== -1) {
                  const existingProduct = cart.products[existingProductIndex];
                  existingProduct.quentity += 1;
                  existingProduct.totalPrice =
                      existingProduct.quentity * existingProduct.productPrice;
              } else {
                  cart.products.push({
                      productId: productId,
                      quentity: 1,
                      productPrice: productToCart.offerprice,
                      totalPrice: productToCart.offerprice,
                      Image: productToCart.image[0],
                  });
              }

              await cart.save();
          } else {
              const newCart = new Cart({
                  userid: userId,
                  products: [
                      {
                          productId: productId,
                          quentity: 1,
                          productPrice: productToCart.offerprice,
                          totalPrice: productToCart.offerprice,
                          Image: productToCart.image[0],
                      },
                  ],
              });

              await newCart.save();
          }

          res.status(200).json({ message: "Product added to cart successfully." });
      } else {
          res.status(400).json({ error: "Invalid product or user." });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
  }
};




module.exports = {
  loadRegister,
  insertUser,
  loadotp,
  verifyOtp,
  resendOtp,
  forgotpass,
  sendResetPasslink,
  sentResetPass,
  resetPage,
  resetPassword,
  loginLoad,
  verifyLogin,
  loadHome,
  loadProduct,
  userLogout,
  userProfile,
  editProfile,
  changePassword,
  removeAddress,
  loadAddAddress,
  addAddressProfile,
  editAddress,
  loadWhishlist,
  addToWishlist,
  removeWishlist,
  wishAddToCart
}
