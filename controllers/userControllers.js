const bcrypt=require("bcrypt")
const User=require("../models/userModel")
const loadRegister=async(req,res)=>{
    try {
        res.render('registeration')
    } catch (error) {
        console.log(error.message);
    }
}

const securePassword=async(password)=>{
    try {
        const passwordHash=await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}


const insertUser = async (req, res) => {
    try {
        const { name, mobile, email, password } = req.body;
  
        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
  
        if (existingUser) {
            return res.render('registeration', { errorMessage: 'Email already exists. Please choose a different email.' });
        }
  
        // If email is not already registered, proceed with user creation
        const spassword = await securePassword(password);
        const user = new User({
            name,
            mobile,
            email,
            password: spassword,
            is_admin: 0
        });
  
        const userData = await user.save();
  
        if (userData) {
            return res.render('registeration', { message: 'Your registration has been successful' });
        } else {
            return res.render('registeration', { message: 'Your registration has failed' });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Internal Server Error');
    }
  };
  
  // login page

  const loginLoad=async(req,res)=>{
    try {
        res.render('login')
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
        if (userData.is_verfied === 0) {
          return res.render('login', { message: 'Login successful' });
        } else {
          // Check if req.session is defined before setting properties
          if (req.session) {
            req.session.user_id = userData._id;
            return res.redirect('/home');
          } else {
            console.error('req.session is undefined');
            return res.status(500).send('Internal Server Error');
          }
        }
      } else {
        return res.render('login', { message: 'Email and password are incorrect' });
      }
    } else {
      return res.render('login', { message: 'Email and password are incorrect' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

const loadHome=async(req,res)=>{
  try {
    res.render("home")
  } catch (error) {
    console.log(error.message);
  }
}



// const register=async(req,res)=>{

//     let {name,mobile,email,password}=req.body
//     name=name.trim()
//     mobile=mobile.trim()
//     email=email.trim()
//     password=password.trim()

//     if(name==""||mobile==""||email==""||password==""){
//         res.json({
//             status:"FAILED",
//             message:"invalid name entered"
//         })
//     }else if(!/^[a-zA-z]*$/.test(name)){
//         res.json({
//             status:"FAILED",
//             message:"invaild name entered"
//         })
//     }else if(mobile.length<10){
//         res.json({
//             status:"FAILED",
//             message:"invaild mobile number entered"
//         })
//     }else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)){
//         res.json({
//             status:"FAILED",
//             message:"invaild mobile number entered"
//     })
//    }else if(password.length<8){
//     res.json({
//         status:"FAILED",
//         message:"password is too short"
//        })
//    }else{
//     //checking if user already exists
//     User.find({email}) .then((result)=>{
//         if(result.length){
//            //A user already exists
//            res.json({
//             status:"FAILED",
//             message:"User with the provided email already exists"
//            })
//         }else{
//             const saltRounds=10;
//             bcrypt
//             .hash(password,saltRounds).then((hashedpassword)=>{
//                 const newUser =new User({
//                     name,
//                     mobile,
//                     email,
//                     password:hashedpassword,
//                     is_verified:0
//                 })
//                 newUser
//                 .save()
//                 .then((result)=>{
//                     // handle account verification
//                     // sendVerificationemail(result,res)
//                 })
//                 .catch((err)=>{
//                     console.log(err);
//                     res.json({
//                         status:"FAILED",
//                         message:"An error occurred while saving user account!"

//                     })
//                 })
//             })
//             .catch((err)=>{
//                 res.json({
//                     status:"FAILED",
//                     message:"An error occurred while hashing password"

//                 })
//             })
//         }
//     })
//     .catch((err)=>{
//         console.log(err);
//         res.json({
//             status:"FAILED",
//             message:"An error occurred while saving user account!"

//         })
//    })

//    }}

//    //send otp verification email
// const sendVerificationemail=async ()=>{
//   try {
//     const otp = `${math.floor(1000+math.random()*9000)}`
//   } catch (error) {
    
//   }
// }

module.exports={
    loadRegister,
    insertUser,
    loginLoad,
    verifyLogin,
    loadHome
}