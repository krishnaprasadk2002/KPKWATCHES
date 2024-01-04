const isLogin=async(req,res,next)=>{
    try {

        if(req.session.user_id){
            if (req.path === '/login') {
                res.redirect('/');
                return;
            }
            next();
        } else {
            if(req.path === '/login'){
                return next();
            }
        }
    } catch (error) {
        console.log(error.message);
        
    }

}

const isLogout = async (req,res,next)=>{
    try {

        if(req.session.user_id){
            res.redirect('/')
            return
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={isLogin,isLogout}