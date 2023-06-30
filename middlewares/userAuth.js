const User = require('../models/userModel')

const userBlock = async (req, res, next) => {
    try {
        if (req.session.user) {
            const userData = req.session.user;

            const user = await User.findById(userData._id);
            // console.log(user,"---------------");
            if (user.blockStatus == false) {
                console.log("Hello-------------------");
                next()
            }
            else {
                console.log("Hiiiiiiiiiiiii------------");
                res.redirect('/logout')
            }
        }
        else {
            console.log("Hiiiiiiiiiiiii------------");
            res.redirect('/logout')
        }
    } catch (error) {
        console.log(error);
        console.log("Hiiiiiiiiiiiii------------catch Error------");
    }
}

const userIsLogOut = async (req, res, next) => {
    try {
        if (!req.session.user) {
            next()
        }
        else {
            res.redirect('/home')
        }
    } catch (error) {

    }
}






module.exports = {

    userIsLogOut,
    userBlock,

}