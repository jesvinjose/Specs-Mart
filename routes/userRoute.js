const express=require('express');
const userRoute=express();
const userController=require('../controllers/userController');
const routeMiddleware=require('../middlewares/routeMiddlewares')
const bodyParser=require('body-parser');
const Product=('../models/productModel')
const auth=require('../middlewares/userAuth')

userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({extended:true}))

userRoute.set('view engine','ejs');
userRoute.set('views','./views/user')

userRoute.get('/',userController.loadHome)
userRoute.get("/home",userController.loadHome);

userRoute.get('/login',auth.userIsLogOut,routeMiddleware.noCache,userController.loadLogin)
userRoute.post('/login',auth.userIsLogOut,userController.verifyLogin)

userRoute.get('/signup',auth.userIsLogOut,userController.loadSignUp)
userRoute.post('/signup',auth.userIsLogOut,userController.sendOtp)

userRoute.get('/logout',userController.loadLogOut)

userRoute.get('/otplogin',auth.userIsLogOut,userController.loadOtpLogIn)
userRoute.post('/otplogin',auth.userIsLogOut,userController.otpLogin)

userRoute.get('/otpverify',auth.userIsLogOut,userController.loadOtpVerify)
userRoute.post('/otpverify',auth.userIsLogOut,userController.otpCheck)

userRoute.get('/verifyotp',auth.userIsLogOut,userController.loadVerifyOtp)
userRoute.post('/verifyotp',auth.userIsLogOut,userController.verifyOtp)

userRoute.get('/product_list',userController.loadProductList)

userRoute.get('/single-product/:_id',userController.loadProductDetail)

userRoute.get('/product-ratings/:_id',auth.userBlock,  userController.loadProductRatingForm)
userRoute.post('/product-ratings/:_id',  userController.saveProductRatingtoDB);

userRoute.get('/addwishlist',auth.userBlock, userController.loadWishlist)
userRoute.post('/addwishlist', userController.addWishList)
userRoute.get('/remove-product',auth.userBlock, userController.removeProductFromWishList)

userRoute.get('/addtocart',auth.userBlock, userController.loadCart)
userRoute.post('/addtocart', userController.addToCart)

userRoute.get('/remove-prodcart',auth.userBlock,userController.removeProductFromCartList)
userRoute.post('/quantity', userController.quantityChange)

userRoute.get('/checkout',auth.userBlock,auth.userBlock, userController.loadCheckOut)

userRoute.post('/addbillingaddress', userController.addBillingAddress)
userRoute.post('/addshippingaddress', userController.addShippingAddress)

userRoute.post('/setBillingAddress', userController.setBillingAddress)
userRoute.post('/setShippingAddress', userController.setShippingAddress)

userRoute.post('/placeorder', userController.placeOrder)
userRoute.get('/confirmation',auth.userBlock, userController.loadConfirmation)

userRoute.get('/profile',auth.userBlock, userController.loadProfile)
userRoute.get('/myorders',auth.userBlock, userController.loadMyOrders)
userRoute.get('/orderDetails',auth.userBlock, userController.loadOrderDetails)

userRoute.get('/fullproducts',userController.loadFullProducts)

userRoute.get('/cancelOrder',auth.userBlock, userController.cancelOrder)
userRoute.get('/returnOrder',auth.userBlock, userController.returnOrder)

userRoute.get('/loadAddresses',auth.userBlock, userController.loadAddresses)
userRoute.post('/saveBillingAddress', userController.saveBillingAddress)
userRoute.post('/saveShippingAddress', userController.saveShippingAddress)

userRoute.post('/saveBillingAddressinCheckout', userController.saveBillingAddressinCheckout)
userRoute.post('/saveShippingAddressinCheckout', userController.saveShippingAddressinCheckout)

module.exports=userRoute