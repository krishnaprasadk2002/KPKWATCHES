const mongoose=require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/Ecommerce-Project")

const express=require("express")
const app=express()

const nocache=require("nocache")
app.use(nocache())

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