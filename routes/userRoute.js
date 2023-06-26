const express=require('express');
const userRoute=express();
const userController=require('../controllers/userController');
const routeMiddleware=require('../middlewares/routeMiddlewares')
const bodyParser=require('body-parser');
const Product=('../models/productModel')

userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({extended:true}))

userRoute.set('view engine','ejs');
userRoute.set('views','./views/user')


userRoute.get('/',routeMiddleware.noCache,userController.loadHome)
userRoute.get("/home",userController.loadHome);
userRoute.get('/login',routeMiddleware.noCache,userController.loadLogin)
userRoute.get('/signup',userController.loadSignUp)
userRoute.post('/login',userController.verifyLogin)
userRoute.post('/signup',userController.sendOtp)
userRoute.get('/logout',userController.loadLogOut)
userRoute.get('/otplogin',userController.loadOtpLogIn)
userRoute.post('/otplogin',userController.otpLogin)
userRoute.post('/otpverify',userController.otpCheck)

userRoute.get('/otpverify',userController.loadOtpVerify)

userRoute.post('/verifyotp',userController.verifyOtp)

userRoute.get('/verifyotp',userController.loadVerifyOtp)

userRoute.get('/product_list/:categoryName',userController.loadProductList)

userRoute.get('/single-product/:_id', userController.loadProductDetail)

// userRoute.get('/shop-single/:_id', userController.loadProductDetail)

userRoute.get('/product-ratings/:_id', userController.loadProductRatingForm)
userRoute.post('/product-ratings/:_id', userController.saveProductRatingtoDB);


userRoute.get('/addwishlist',userController.loadWishlist)
userRoute.post('/addwishlist',userController.addWishList)
userRoute.get('/remove-product',userController.removeProductFromWishList)

userRoute.get('/addtocart',userController.loadCart)
userRoute.post('/addtocart',userController.addToCart)



userRoute.get('/remove-prodcart',userController.removeProductFromCartList)
userRoute.post('/quantity',userController.quantityChange)

userRoute.get('/checkout',userController.loadCheckOut)

userRoute.post('/addbillingaddress',userController.addBillingAddress)
userRoute.post('/addshippingaddress',userController.addShippingAddress)

userRoute.post('/setBillingAddress',userController.setBillingAddress)
userRoute.post('/setShippingAddress',userController.setShippingAddress)

userRoute.post('/placeorder',userController.placeOrder)
// userRoute.post('/placeOrderwithRazorpay',userController.placeOrderwithRazorpay)
userRoute.get('/confirmation',userController.loadConfirmation)

userRoute.get('/profile',userController.loadProfile)
userRoute.get('/myorders',userController.loadMyOrders)
userRoute.get('/orderDetails',userController.loadOrderDetails)

userRoute.get('/fullproducts',userController.loadFullProducts)

userRoute.get('/cancelOrder',userController.cancelOrder)
userRoute.get('/returnOrder',userController.returnOrder)

userRoute.get('/loadAddresses',userController.loadAddresses)
userRoute.post('/saveBillingAddress',userController.saveBillingAddress)
userRoute.post('/saveShippingAddress',userController.saveShippingAddress)

module.exports=userRoute