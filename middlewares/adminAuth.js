
const isLogin=async(req,res,next)=>{
    try {
        if(req.session.user)
        {

        }
        else{
            res.redirect('/admin')
        }
        next();
    } catch (error) {
        console.log(error);
    }
}

const isLogOut=async(req,res,next)=>{
    try {
        if(req.session.user)
        {
            redirect('/admin/home')
        }
        else{

        }
        next();
    } catch (error) {
        
    }
}

module.exports={
    isLogin,
    isLogOut
}