const isLogin=async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.render("home")
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout=async(req,res,next)=>{
    try {
        if (req.session.user_id) {
            next()
        } else {
            res.render("home")
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports={isLogin,isLogout}