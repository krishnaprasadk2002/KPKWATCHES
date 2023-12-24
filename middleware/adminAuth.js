const islogin=async (req,res,next)=>{
    try {
        if(req.session.user_id){
           next()
        }else{
            res.render("login")
        }
    } catch (error) {
        console.log(error.message);
    }
}

const islogout=async (req,res,next)=>{
    try {
        if(req.session.user_id){
            next()
        }else{
            res.render("login")
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={islogin,islogout}