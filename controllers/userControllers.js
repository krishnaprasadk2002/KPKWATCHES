const bcrypt = require("bcrypt");
const User = require("../models/userModel");

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

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });

    const errorMessage='Email already exists. Please choose a different email.'
    const message='Your registration has been successful'

    if (existingUser) {
      return res.render('registeration', { errorMessage});
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
      return res.render('registeration', { message });
    } else {
      return res.render('registeration', { errorMessage});
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send('Internal Server Error');
  }
};

// login page

const loginLoad = async (req, res) => {
  try {
    res.render('login');
  } catch (error) {
    console.log(error.message);
  }
}

// const verifyLogin = async (req, res) => {
//   try {
//     const email = req.body.email;
//     const password = req.body.password;
//     const userData = await User.findOne({ email: email });

//     if (userData) {
//       const passwordMatch = await bcrypt.compare(password, userData.password);

//       if (passwordMatch) {
//         if (userData.is_verfied === 0) {
//           return res.render('login', { message: 'Login successful' });
//         } else {
         
//           if (req.session) {
//             req.session.user_id = userData.name;
//             return res.redirect('/');
//           } else {
//             console.error('req.session is undefined');
//             return res.status(500).send('Internal Server Error');
//           }
//         }
//       } else {
//         return res.render('login', { message: 'Email and password are incorrect' });
//       }
//     } else {
//       return res.render('login', { message: 'Email and password are incorrect' });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send('Internal Server Error');
//   }
// };

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.status === 'Active') {
          // User is active, allow login
          if (req.session) {
            req.session.user_id = userData.name;
            return res.redirect('/');
          } else {
            console.error('req.session is undefined');
            return res.status(500).send('Internal Server Error');
          }
        } else {
          // User is blocked
          return res.render('login', { message: 'User account is blocked' });
        }
      } else {
        // Incorrect password
        return res.render('login', { message: 'Email and password are incorrect' });
      }
    } else {
      // User not found
      return res.render('login', { message2: '' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

const loadHome = async (req, res) => {
  const username=req.session.user_id;
  try {
    if(req.session.user_id){
    res.render("home",{username});
    }else{
     res.render("home")
    }
  } catch (error) {
    console.log(error.message);
  }
}

//  Product list

const loadProduct=(req,res)=>{
  try {
    res.render("allproduct")
  } catch (error) {
    console.log(error.message)
  }
}

const userLogout=async(req,res)=>{
  try {
    req.session.destroy()
    res.redirect("/")
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  loadRegister,
  insertUser,
  loginLoad,
  verifyLogin,
  loadHome,
  loadProduct,
  userLogout
}
