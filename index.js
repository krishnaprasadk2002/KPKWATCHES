const mongoose=require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/Ecommerce-Project")

const express=require("express")
const app=express()

const PORT=process.env.PORT || 4000
const path=require("path")

app.use(express.static(path.join(__dirname,'public')))
// app.use("/public", express.static(path.join(__dirname, 'public')));
// app.use('/',user)
// app.use('/',admin)

//user route
const userRoute=require('./routes/userRoute')
app.use('/',userRoute)

app.listen(PORT,()=>{
    console.log(`server connected at http://localhost:${PORT}/`);
})