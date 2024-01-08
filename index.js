const mongoose=require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/Ecommerce-Project")

const express=require("express")
const app=express()

require('dotenv').config();
const flash=require("express-flash")
const session=require("express-session")
const config = require('./config/config');
app.use(session({secret: config.sessionSecret,
    resave: false, 
    saveUninitialized: true  
  }));
  
const nocache=require("nocache")
app.use(nocache())

app.use(flash())

const PORT=process.env.PORT || 4000
const path=require("path")

app.use(express.static(path.join(__dirname,'public')))


//user route
const userRoute=require('./routes/userRoute')
app.use('/',userRoute)

const adminRoute=require("./routes/adminRoute")
app.use('/admin',adminRoute)


app.listen(PORT,()=>{
    console.log(`server connected at http://localhost:${PORT}/`);
})