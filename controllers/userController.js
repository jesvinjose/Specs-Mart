const User = require('../models/userModel');
const Category = require('../models/categoryModel')
const Product = require('../models/productModel')
const Carousel = require('../models/carouselModel')
// const Review = require('../models/reviewModel')
const BillingAddress = require('../models/billingAddressModel')
const ShippingAddress = require('../models/shippingAddressModel')
const Order = require('../models/orderModel')
const bcrypt = require('bcrypt');
const session = require('express-session')
const validator = require('validator');
const Razorpay = require('razorpay')
const Coupon = require('../models/couponModel')
const Offer = require('../models/offerModel')
const PDFDocument = require('pdfkit');

const mongoose = require('mongoose');
const { Schema, model } = mongoose;


//To sent otps during user registration
const nodemailer = require('nodemailer'); // Import Nodemailer for sending emails
const { ObjectId } = require('mongodb');
// const billingAddress = require('../models/billingAddressModel');


let userData

//To load Home Page
const loadHome = async (req, res) => {
  try {
    const categoryData = await Category.find({ isDisabled: false })
    // console.log(categoryData,"categoryData=====================================");
    // console.log(req.session.user,"-----------session----------");
    const latestProducts = await Product.find().sort({ createdAt: -1 }).limit(6);
    const offerData = await Offer.find({ category: { $exists: true } }).populate("category");
    // console.log(offerData,"hi--------------------------");
    if (req.session.user) {
      let data = req.session.user;
      const currentuser = await User.findById(data._id);
      // console.log(currentuser,"-------------if------------------");
      res.render('home', { userData: currentuser, categories: categoryData, products: latestProducts, offers: offerData })

    } else {
      // console.log("----else----------");
      res.render('home', { userData: "", categories: categoryData, products: latestProducts, offers: offerData });
    }

  } catch (error) {
    console.log(error);
  }
};

//To load Product Detail Page
const loadProductDetail = async (req, res) => {
  try {
    // console.log("Hitting Product Detail--------------------------");
    const _id = req.params._id;
    // console.log(_id,"-----------id------------");

    const singleProduct = await Product.find({ _id: _id })
    // console.log(singleProduct);
    const oneImage = singleProduct[0].imageUrls[0]
    // console.log(oneImage);
    if (req.session.user != undefined) {
      const data = req.session.user;
      // console.log(_id) 
      res.render('single-product', { product: singleProduct, userData: data, oneImage: oneImage })
    }
    else {
      res.render('single-product', { product: singleProduct, oneImage: oneImage })
    }

  } catch (error) {
    console.log(error)
  }
}

//To load Login Page
const loadLogin = async (req, res) => {
  try {
    // console.log("Hi LoadLogin");
    res.render('login');
  } catch (error) {
    console.log(error);
  }
};

//To load otplogin Page
const loadOtpLogIn = async (req, res) => {
  try {

    res.render('otplogin');
  } catch (error) {
    console.log(error.message);
  }
}

//To logout and render login page again
const loadLogOut = async (req, res) => {
  try {
    req.session.destroy();
    // console.log('inside logout');
    // console.log(req.session);
    res.render('login');
  } catch (error) {
    console.log(error);
  }
}

//To load signUp Page
const loadSignUp = async (req, res) => {
  try {
    res.render('signup');
  } catch (error) {
    console.log(error);
  }
};


//To load verifyotp Page
const loadVerifyOtp = async (req, res) => {
  try {
    res.render('verifyotp');
  } catch (error) {
    console.log(error);
  }
};

//To bcrypt the password entered during signup (called in verifyOtp function)
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 8);
    return passwordHash;
  } catch (error) {
    console.log(error);
  }
};

// Function to generate a random OTP during user signup and otplogins
const generateOTP = function () {
  return Math.floor(100000 + Math.random() * 900000);
}

const sendOtp = async (req, res) => {
  try {

    // console.log(req.body);
    req.session.signUp = req.body;
    // console.log(req.session.signUp);
    const { referalOTP, userName, email, mobile, password, confirmPassword } = req.body;
    // console.log(req.session.signUp,"----------sU------------");
    // console.log(req.body,'------------body-------------');
    if (referalOTP) {
      if (!mongoose.Types.ObjectId.isValid(referalOTP)) {
        return res.render("signup", { footer: "Invalid referral OTP" });
      }
      const existingUser = await User.findById(referalOTP);
      if (!existingUser) {
        return res.render("signup", { footer: "Invalid referral OTP" });
      }
      // Add wallet balance of 200 to the referred user
      existingUser.wallet.balance += 200;
      await existingUser.save();
    }

    // Validate email
    if (!email || !validator.isEmail(email)) {
      return res.render("signup", { footer: "Please enter a valid email address" });
    }

    // Validate mobile number
    if (!mobile || !validator.isMobilePhone(mobile)) {
      return res.render("signup", { footer: "Please enter a valid mobile number" });
    }

    // Validate username
    if (!userName || userName.trim().length === 0) {
      return res.render("signup", { footer: "Please enter a valid username" });
    }

    // Validate password
    if (!password || password.length < 8) {
      return res.render("signup", { footer: "Password should be at least 8 characters long" });
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      return res.render("signup", { footer: "Passwords do not match" });
    }

    const emailExist = await User.findOne({ email: req.body.email });
    if (!emailExist) {
      // console.log("Email exists-----"+emailExist);
      if (!req.session.saveOtp) {
        let generatedOtp = generateOTP();
        // console.log("Check gen OTP:",generatedOtp);
        req.session.saveOtp = generatedOtp;
        // console.log("Hi here"+req.body);
        sendOtpMail(email, generatedOtp);
        res.render("verifyotp", { footer: "" })
        setTimeout(() => {
          req.session.saveOtp = null;
        }, 60 * 1000);
      } else {
        res.redirect('/verifyotp')
      }
    } else {
      res.render("signup", { footer: "Userdata already exists" })
    }
  } catch (error) {
    console.log(error.message);
  }
};

async function sendOtpMail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'jesvinjose49@gmail.com',
        pass: 'yyrasmmhnslhbidv'
      }
    });
    const mailOptions = {
      from: 'jesvinjose49@gmail.com',
      to: email,
      subject: 'Your OTP for user verification',
      text: `Your OTP is ${otp}. Please enter this code to verify your account.`
    };

    const result = await transporter.sendMail(mailOptions);
    // console.log(result);
  } catch (error) {
    console.log(error.message);
  }
}

const verifyOtp = async (req, res) => {
  // console.log("check1");
  // console.log(req.session.saveOtp);
  // console.log(req.body.otp);
  const EnteredOtp = req.body.otp;
  // console.log("check2");
  if (EnteredOtp == req.session.saveOtp) {
    // console.log("check3");

    const securedPassword = await securePassword(req.session.signUp.password);
    const newUser = new User({
      email: req.session.signUp.email,
      mobile: req.session.signUp.mobile,
      userName: req.session.signUp.userName,
      password: securedPassword,
      blockStatus: false,
      isVerified: true
    });

    // Add wallet balance of 100 to the new user
    if (req.session.signUp.referalOTP) {
      newUser.wallet.balance = 100;
    }

    // Set referral OTP as ObjectId of the newly created user
    newUser.wallet.referalOTP = newUser._id;
    await newUser.save();
    req.session.signUp = null;
    res.render("login", { footer: "Account Created Successfully, Please Login" });
  } else {
    res.render("verifyotp", { footer: "Incorrect OTP" })
  }
}

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (userData.blockStatus === true) {
        return res.render("login", { footer: "Your account is blocked - conatct: jesvinjose49@gmail.com" });
      }

      if (passwordMatch && userData.isAdmin===0) {
        req.session.user = userData;
        res.redirect('/')
      }
      if(userData.isAdmin===1 && passwordMatch)
      {
        res.render("login", { footer: "Invalid User" });
      }
      if (!passwordMatch) {
        res.render("login", { footer: "Entered password is wrong" });
      }
    } else {
      res.render("login", { footer: "You are not registered. please register now!!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Function to send OTP via email
const sendOTPByEmail = async (email, otp) => {
  // Configure your email provider here (e.g., Gmail, SendGrid, etc.)
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "jesvinjose49@gmail.com",
      pass: "yyrasmmhnslhbidv",
    },
  });

  const mailOptions = {
    from: "jesvinjose49@gmail.com",
    to: email,
    subject: "OTP for Login",
    text: `Your OTP for login is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully!");
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email.");
  }
};

// OTP login function
const otpLogin = async (req, res) => {

  const { email } = req.body;

  try {
    // Check if the user email exists
    const user = await User.findOne({ email });
    if(user.blockStatus===true)
    {
      return res.render("otplogin", { error: "User is Blocked" });
    }
    if (!user) {
      return res.render("otplogin", { error: "User email not found" });
    }
    if(user.isAdmin===1)
    {
      return res.render("otplogin", { error: "Invalid User" });
    }

    // Generate and save OTP for the user
    const otp = generateOTP();
    user.otp = otp;
    await user.save();
    // console.log(user);

    // Send OTP via email
    await sendOTPByEmail(email, otp);
    // console.log("check after sendOtp");
    req.session.userEmail = email;
    // return res.redirect(`/otpverify?email=${email}`);
    // Render the OTP login view
    return res.render("otpverify", { email });
  } catch (error) {
    console.error("Error in OTP login:", error);
    return res.render("login", { error: "Failed to initiate OTP login" });
  }
};

const otpCheck = async (req, res) => {
  // console.log("check body------" + req.body);
  const { otp } = req.body;
  let userEmail = req.session.userEmail
  const user = await User.findOne({ email: userEmail });
  if (user && user.otp == otp) {
    // console.log("Entered")
  } else {
    // console.log("Not Entered")
  }
  // console.log(user);
  // console.log(user.otp);
  // console.log(req.body.otp);
  if (user.otp == otp) {
    req.session.user = user;
    req.session.userEmail = null;
    res.redirect("/");
  }
  else {
    res.render("otpverify", { footer: "Entered password is wrong" });
  }
}

const loadOtpVerify = async (req, res) => {
  try {
    res.render('otpverify');
  } catch (error) {
    console.log(error);
  }
}

const loadProductRatingForm = async (req, res) => {
  try {
    const _id = req.params._id;
    const singleProduct = await Product.find({ _id: _id })
    res.render('productratingsform', { product: singleProduct })
  } catch (error) {
    console.log(error)
  }
}

const saveProductRatingtoDB = async (req, res) => {
  try {
    const { _id } = req.params;
    const { rating, comment } = req.body;
    // console.log(_id);
    // console.log(req.session.user)
    // Perform validation and handle the saving of the review to the database

    const product = await Product.findById(_id);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    // const id = new ObjectId(req.query.id);

    const newReview = new Review({
      rating,
      comment,
      user: req.session.user._id // Assuming you have a user authenticated and you have access to the user's ID
    });

    const savedReview = await newReview.save();

    product.reviews.push(savedReview._id); // Push the ObjectId of the newReview instead of the entire object
    await product.save();

    res.send('Review Submitted');
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
}

const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userData = req.session.user;
    // console.log(userData,"---------userData------------------");
    // console.log(userData)
    if (!userData) {
      res.json('usernotloggedin')
      return;
    }
    if (userData.blockStatus == true) {
      res.json('userblocked')
      return;
    }
    const user = await User.findById(userData._id);
    if (!user.cart) {
      user.cart = [];
    }
    const idToCheck = productId;
    // console.log(idToCheck,"--------------------idtoCheck------------------------");
    // console.log('Hitting add to Cart');

    // Check if the product already exists in the cart
    const existingCartItem = user.cart.find(item => item.products.toString() == idToCheck);
    if (existingCartItem) {
      // console.log('Hitting existing product in add to Cart');
      // Product already exists in the cart
      res.json("Iteminside")
      // return res.redirect('/addtocart');
    } else {
      // Product does not exist in the cart, add it
      user.cart.push({ products: idToCheck });
      await user.save();
      res.json("success");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



const addWishList = async (req, res) => {
  try {
    // console.log("addWishList");
    const { productId } = req.body;
    const userData = req.session.user;
    if (!userData) {
      res.json('usernotloggedin')
      return;
    }
    if (userData.blockStatus == true) {
      // log("hi-------blocked")
      res.json('userblocked')
      return;
    }
    const user = await User.findById(userData._id);
    if (!user.wishList) {
      user.wishList = []; // Initialize wishList as an empty array if it's undefined
    }
    const idToCheck = productId;

    const isIdNotPresent = !user.wishList.some(obj => obj._id == idToCheck);
    // const objId = user.wishList.filter(obj => obj._id == idToCheck)
    // console.log(objId, "2002");
    // console.log(isIdNotPresent, "2003");
    if (isIdNotPresent) {
      user.wishList.push(idToCheck)
      await user.save();
      res.json("success"); // Return only the wishlist product IDs
    }
    else {
      // console.log("Check----------------------");
      res.json("Productexists");
    }
    // console.log(user, "+---------------------user---------------------");

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error adding product to wishlist!" });
  }
};

const removeProductFromWishList = async (req, res) => {
  try {
    const id = new ObjectId(req.query.id)
    const data = req.session.user;
    await User.updateOne(
      { _id: data._id },
      { $pull: { wishList: id } }
    )
    res.redirect('/addwishlist')

  } catch (error) {

  }
}

const removeProductFromCartList = async (req, res) => {
  try {
    const productId = req.query.id;
    const userId = req.session.user._id;

    await User.updateOne(
      { _id: userId },
      { $pull: { cart: { products: productId } } }
    );

    res.redirect('/addtocart');
  } catch (error) {
    // Handle error
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};

const quantityChange = async (req, res) => {
  if (req.session.user !== undefined) {
    const userData = req.session.user;
    try {
      // console.log(req.body, userData, "+++++++++++++");

      const { prodId, status } = req.body;
      if (status === 'increment') {
        await User.findOneAndUpdate(
          { _id: userData._id, 'cart.products': prodId },
          { $inc: { 'cart.$.quantity': 1 } },
          { new: true }
        );
      } else {
        // Check if the quantity is greater than 1 before decrementing
        const user = await User.findOne({ _id: userData._id, 'cart.products': prodId });
        const cartItem = user.cart.find((item) => item.products.toString() === prodId);

        if (cartItem.quantity > 1) {
          await User.findOneAndUpdate(
            { _id: userData._id, 'cart.products': prodId },
            { $inc: { 'cart.$.quantity': -1 } },
            { new: true }
          );
        }
      }
      const quant = await User.findOne(
        { _id: userData._id, 'cart.products': prodId },
        { 'cart.$': 1 }
      );
      const product = await Product.findById(prodId)
      let totalprice = product.price * quant.cart[0].quantity

      const userWithCartDetails = await User.findById(userData._id)
        .populate({
          path: 'cart',
          populate: {
            path: 'products',
          },
        });
      const productsCheck = userWithCartDetails.cart.map(item => ({
        products: item.products,
        quantity: item.quantity
      }));

      // console.log(productsCheck);

      var totalPriceofProducts = 0
      for (const item of productsCheck) {
        const { products, quantity } = item;
        const itemTotalPrice = products.price * quantity;
        totalPriceofProducts += itemTotalPrice;
      }

      // console.log('Overall Price:',totalPriceofProducts);

      res.json({ status: 'success', quantity: quant.cart[0].quantity, totalprice: totalprice, totalPriceofProducts: totalPriceofProducts });
    } catch (error) {
      console.log(error);
    }
  }
};


const loadWishlist = async (req, res) => {
  try {
    if (req.session.user !== undefined) {
      let data = req.session.user;
      const userWithWishlistDetails = await User.findById(data._id)
        .populate('wishList');

      // console.log(userWithWishlistDetails.wishList);
      res.render('wishlist', { userData: data, wishList: userWithWishlistDetails.wishList });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadCart = async (req, res) => {
  try {
    // console.log("Inside loadCart");
    if (req.session.user !== undefined) {
      const data = req.session.user;
      const userWithCartDetails = await User.findById(data._id)
        .populate({
          path: 'cart',
          populate: {
            path: 'products',
          },
        });
      const productsCheck = userWithCartDetails.cart.map(item => ({
        products: item.products,
        quantity: item.quantity
      }));

      // console.log(productsCheck); // Array of product values
      var subtotal = 0;
      productsCheck.forEach(val => {
        if (val.products) {
          val.total = val.products.price * val.quantity;
          subtotal += val.total;
        }
      });

      res.render('cart', { userData: data, products: productsCheck, subtotal });
    }
  } catch (error) {
    console.log(error);
  }
};



const loadCheckOut = async (req, res) => {
  try {
    if (req.session.user !== undefined) {
      const data = req.session.user;
      const shippingAddresses = await ShippingAddress.find({ userId: data._id })
      const billingAddresses = await BillingAddress.find({ userId: data._id })
      const userobj = await User.findOne({ _id: data._id })
      // console.log(billingAddresses,"----------------Billing Addresses---------------");
      // console.log(shippingAddresses,"----------------shippingAddress----------------");
      var couponData = await Coupon.find({ usedBy: { $ne: data._id } });
      const userWithCartDetails = await User.findById(data._id)
        .populate({
          path: 'cart',
          populate: {
            path: 'products',
          },
        });
      const productsCheck = userWithCartDetails.cart.map(item => ({
        products: item.products,
        quantity: item.quantity
      }));

      // console.log(productsCheck); // Array of product values
      var subtotal = 0;
      productsCheck.forEach(val => {
        if (val.products) {
          val.total = val.products.price * val.quantity;
          subtotal += val.total;
        }
      });
      // console.log(productsCheck,"---------------------productsCheck---------------------------");
      // console.log(productsCheck.length,'product length')
      if (productsCheck.length == 0) {
        // console.log('inside if')
        // res.json('empty')
        res.status(404).send();
        // res.redirect('/empty-cart');

      } else {
        res.render('checkout', { userData: data, shippingAddresses: shippingAddresses, billingAddresses: billingAddresses, products: productsCheck, subtotal, couponData, walletamount: userobj.wallet.balance })

      }
    }
  } catch (error) {
    console.log(error);
  }
}


// const loadEmptyCart=async(req,res)=>{
//   console.log("Inside Empty cart");
//   res.send("inside empty")
//   // res.send(`
//   //   <script>
//   //     Swal.fire({
//   //       icon: 'info',
//   //       title: 'Empty Basket',
//   //       text: 'Your cart is currently empty.',
//   //       html: '<i class="fas fa-shopping-cart"></i>', // Replace with the Font Awesome icon class
//   //       showCancelButton: false,
//   //       showConfirmButton: false,
//   //     });
//   //   </script>
//   // `);
// }

// const addToCart = async (req, res) => {
//   try {
//     const userId = req.session.user._id;
//     const productId = req.body.id;

//     // Find the user by their ID
//     const user = await User.findById(userId);

//     // Find the product by its ID
//     const product = await Product.findById(productId);

//     // Check if the product or user is not found
//     if (!product || !user) {
//       return res.status(404).json({ error: 'Product or user not found' });
//     }

//     // Check if the product is already in the user's cart
//     const existingCartItem = user.cart.find(item => item.product.toString() == productId);
//     if (existingCartItem) {
//       // If the product already exists, increment the quantity
//       existingCartItem.quantity++;
//     } else {
//       // If the product doesn't exist, add it to the cart
//       user.cart.push({ product: productId });
//     }

//     // Save the user with the updated cart
//     await user.save();

//     res.status(200).json({ message: 'Product added to cart successfully' });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'An error occurred while adding the product to the cart' });
//   }
// }

// const loadCart = async (req, res) => {
//   try {
//     if (req.session.user !== undefined) {
//       const userData = req.session.user;
//       const id = userData._id;
//       const user = await User.findOne({ _id: id }).populate('cart.products').lean();
//       const cart = user.cart
//       let subtotal = 0;
//       cart.forEach((val) => {
//         val.total = val.product.price * val.quantity;
//         subtotal += val.total;
//       });

//       if (cart.length === 0) {
//         res.render("emptyCart", { userData });
//       } else {
//         res.render("cart", { userData, cart, subtotal });
//       }
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'An error occurred while adding the product to the cart' });

//   }
// }

const addBillingAddress = async (req, res) => {
  try {
    const userData = req.session.user;
    // console.log(userData,"-------------userData-Check-------------");
    const userId = userData._id;

    const billingAddress = new BillingAddress({
      userId: userId,
      name: req.body.name,
      mobile: req.body.mobileNumber,
      addressLine: req.body.addressLine,
      city: req.body.city,
      email: req.body.email,
      state: req.body.state,
      pincode: req.body.pincode,
      is_default: false,
    });

    await billingAddress.save();
    // res.redirect('/checkout')
    res.redirect('back'); // Reload the current page
  } catch (error) {
    res.status(500).send();
    console.log(error.message);
  }
}

const addShippingAddress = async (req, res) => {
  try {
    const userData = req.session.user;
    // console.log(userData,"-------------userData-Check-------------");
    const userId = userData._id;

    const shippingAddress = new ShippingAddress({
      userId: userId,
      name: req.body.name,
      mobile: req.body.mobileNumber,
      addressLine: req.body.addressLine,
      city: req.body.city,
      email: req.body.email,
      state: req.body.state,
      pincode: req.body.pincode,
      is_default: false,
    });

    await shippingAddress.save();
    // res.redirect('/checkout')
    res.redirect('back'); // Reload the current page
  } catch (error) {
    res.status(500).send();
    console.log(error.message);
  }
}

//to bring billing address to order summary table
const setBillingAddress = async (req, res) => {
  try {
    const { billingAddress } = req.body;
    req.session.user.billingDetail = billingAddress;
    const BillingDetails = await BillingAddress.findById(billingAddress)
    // console.log(BillingDetails);
    // console.log(req.body)
    // Return a response
    res.json({ success: true, message: 'Billing address passed successfully', data1: BillingDetails });
  } catch (error) {
    console.log(error);
  }
}

//to bring shipping address to order summary table
const setShippingAddress = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    req.session.user.shippingDetail = shippingAddress;
    // console.log(req.body)
    const ShippingDetails = await ShippingAddress.findById(shippingAddress)
    // console.log(ShippingDetails);
    // Return a response
    res.json({ success: true, message: 'Shipping address passed successfully', data2: ShippingDetails });
  } catch (error) {
    console.log(error);
  }
}

const placeOrder = async (req, res) => {
  try {
    // console.log("working")
    let subtotal = req.body.subtotal;
    let couponCode = req.body.couponCode;
    subtotal = isNaN(subtotal) ? 0 : Number(subtotal); // Check if subtotal is NaN and provide a default value
    // console.log(couponCode,"11111111111111111");
    const validCoupon = await Coupon.findOne({ couponCode: couponCode })
    const usedWallet = req.body.usedWalletAmount;
    // usedWallet=isNaN(usedWallet) ? 0:Number(usedWallet)
    // const usedWallet=req.body.usedWallet; // Declare and assign usedWallet value
    // console.log(usedWallet, "11111111111111111");

    var paymentMethod = req.body.paymentMethod;
    // console.log(paymentMethod);
    // console.log(subtotal);
    const userData = req.session.user
    const user = await User.findById(userData._id);
    // console.log(user,"--------------------user----------------");
    const productDetails = await Product.find({})
    // console.log(productDetails,"----------------productDetails--------------");
    // console.log(user.cart,"---------cart check----------------");
    const productsInCart = user.cart.map((item) => ({
      productId: item.products,
      quantity: item.quantity,
    }));
    // console.log(productsInCart,"----------productsInCart-----------------");
    let hasInsufficientStock = false;

    for (const item of productsInCart) {
      
      // console.log(item.quantity,"------cartQuantity");
      // console.log(item.productId,"------------------");
      const product=await Product.findById(item.productId)
      // console.log(product,"---------------product");
      if (item.quantity > product.stockCount) {
        // The quantity in cart is greater than the available stock count
        hasInsufficientStock = true;
        break;
      }
    }
    // console.log(hasInsufficientStock,"----------true or false");
    if (hasInsufficientStock===true) {
      // console.log("Insufficient stock for one or more products");
      return res.status(400).json({ error: 'Insufficient stock for one or more products' });
    }
    const orderItems = []; 
    
    for (const item of productsInCart) {
      const product = productDetails.find((p) => p._id.toString() === item.productId.toString());

      if (product) {
        product.stockCount -= item.quantity;
        await product.save();
        // console.log(product, "ppppppppppppppppppppppppppppp");
        const orderItem =
        {
          id: product._id,
          name: product.productName,
          price: product.price,
          quantity: item.quantity,
          image: product.imageUrls[0].url,
          brand: product.productBrand
        };
        orderItems.push(orderItem);
      }
    }

    // console.log(orderItems);
    function generateOrderId() {
      return Math.floor(Math.random() * 100000000)
    }


    if (paymentMethod == 'cod') {
      var newOrder = new Order({
        userId: user._id,
        product: orderItems,
        billingaddress: req.session.user.billingDetail,
        shippingaddress: req.session.user.shippingDetail,
        orderId: generateOrderId(),
        total: subtotal,
        paymentMethod: paymentMethod,
        usedWallet: usedWallet
      });

      user.wallet.balance = user.wallet.balance - usedWallet;

      user.cart = [];
      await user.save();

      await newOrder.save();

      if (validCoupon) {
        validCoupon.usedBy.push(user._id);
        // console.log(validCoupon);
        await validCoupon.save();
      }
      // console.log(orderItems);

      res.json({ success: true, order: newOrder });
    }
    else if (paymentMethod == 'wallet') {

      // console.log("Hi wallet....");
      if (subtotal > user.wallet.balance) {
        // console.log("Hi wallet balance....");
        return res.status(400).json({ error: 'Insufficient balance in the wallet' });
      }
      else {
        user.wallet.balance = user.wallet.balance - usedWallet;
        console.log(user.wallet.balance, "---------------------uwb");
        var newOrder = new Order({
          userId: user._id,
          product: orderItems,
          billingaddress: req.session.user.billingDetail,
          shippingaddress: req.session.user.shippingDetail,
          orderId: generateOrderId(),
          total: subtotal,
          paymentMethod: paymentMethod,
          usedWallet: usedWallet
        });

        user.cart = [];
        await user.save();
        // console.log(user,"new user------------------");
        await newOrder.save();

        if (validCoupon) {
          validCoupon.usedBy.push(user._id);
          // console.log(validCoupon);
          await validCoupon.save();
        }

        // console.log(orderItems);
        res.json({ success: true, order: newOrder });
      }
    } else {
      if (paymentMethod == 'gpay') {

        // console.log(paymentMethod, "----------inside gpay-------------");
        try {
          const options = {
            amount: subtotal * 100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: generateOrderId(),
          };

          var instance = new Razorpay({ key_id: 'rzp_test_ORkJ65oKPb4Z48', key_secret: 'AYEvrnuXqhkw3DJ5NO71mzWQ' })
          const order = await instance.orders.create(options);

          // console.log(user._id, "1");
          // console.log(orderItems, "2");
          console.log(req.session.user.billingDetail, "3");
          var newOrder = new Order({
            userId: user._id,
            product: orderItems,
            billingaddress: req.session.user.billingDetail,
            shippingaddress: req.session.user.shippingDetail,
            orderId: options.receipt,
            total: subtotal,
            paymentMethod: paymentMethod,
            usedWallet: usedWallet
          });

          await newOrder.save();
          // console.log(options.receipt, "-----optionsReceipt------------");

          // console.log(order, "------------newOrder--------------");
          user.wallet.balance = user.wallet.balance - usedWallet;
          user.cart = [];
          await user.save();

          if (validCoupon) {
            validCoupon.usedBy.push(user._id);
            // console.log(validCoupon);
            await validCoupon.save();
          }
          res.json({ success: true, order: order, amount: options.amount, newOrder });
        } catch (error) {
          res.status(500).json({ error: 'An error occurred while creating the order' });
        }
      }
    }
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while placing the order' });
  }
}





const loadConfirmation = async (req, res) => {
  try {
    // console.log("Hi load confirmation");
    const userData = req.session.user;
    const orderId = req.query.orderId;
    // const order = JSON.parse(req.query.order);
    // console.log(order,"-----------order---------------");
    const orderDetails = await Order.findOne({ orderId: orderId })
    // console.log(orderDetails);
    // console.log(userData.billingDetail);
    // console.log(userData.shippingDetail);

    const BillingAddressDetail = await BillingAddress.find({ _id: userData.billingDetail })
    // console.log(BillingAddressDetail);
    const ShippingAddressDetail = await ShippingAddress.find({ _id: userData.shippingDetail })
    // console.log(ShippingAddressDetail);
    if (userData !== 'undefined') {
      res.render('confirmation', { userData: userData, order: orderDetails, BillingAddress: BillingAddressDetail, ShippingAddress: ShippingAddressDetail })
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
}

const loadProfile = async (req, res) => {
  try {
    const userData = req.session.user;
    if (userData !== 'undefined') {
      const userobj = await User.findOne({ _id: userData._id })
      // console.log(userobj.wallet.balance,"-----------------");
      res.render('profile', { userData: userData, walletamount: userobj.wallet.balance })
    }

  } catch (error) {
    console.log(error);
  }
}

// const loadMyOrders = async (req, res) => {
//   try {
//     const userData = req.session.user;
//     if (userData !== 'undefined') {
//       const orderData = await Order.find({ userId: userData._id })
//       res.render('orders', { userData: userData, orderData: orderData })
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

const loadMyOrders = async (req, res) => {
  try {
    const userData = req.session.user;
    if (userData !== 'undefined') {
      const orderData = await Order.find({ userId: userData._id }).sort({ date: -1 });
      res.render('orders', { userData: userData, orderData: orderData });
    }
  } catch (error) {
    console.log(error);
  }
};


const loadOrderDetails = async (req, res) => {
  try {
    const userData = req.session.user;
    if (userData !== 'undefined') {
      const orderId = req.query.orderId
      // console.log(orderId);
      // console.log(typeof(orderId));
      const orderData = await Order.find({ orderId: orderId })
      // console.log(orderData,"--------orderdata----------");
      // Retrieve product details
      // const productDetails = [];
      // for (const product of orderData[0].product) {
      //   const productDetail = await Product.findById(product.id);
      //   productDetails.push(productDetail);
      // }
      // // console.log(productDetails);
      const BillingAddressDetail = await BillingAddress.findById(orderData[0].billingaddress);
      // console.log(BillingAddressDetail,"-----------BillingAddressDetail-------------");
      const ShippingAddressDetail = await ShippingAddress.findById(orderData[0].shippingaddress);
      // console.log(ShippingAddressDetail,"--------------ShippingAddressDetail---------------");
      res.render('orderDetails', { userData: userData, orderData: orderData, BillingAddress: BillingAddressDetail, ShippingAddress: ShippingAddressDetail })
    }
  } catch (error) {
    console.log(error);
  }
}

const loadProductList = async (req, res) => {
  try {
    const categoryName = req.query.category;
    // console.log("Hi loadProductList----------");
    const banners = await Carousel.find();

    // Sorting
    const sort = req.query.sort || '';
    let sortOption = {};
    if (sort === 'price_low') {
      sortOption = { price: 1 }; // Sort by price in ascending order
      // console.log(sortOption, "--------------lowToHigh");
    } else if (sort === 'price_high') {
      sortOption = { price: -1 }; // Sort by price in descending order
    }

    // Searching
    let search = req.query.search || '';
    let query = { isDisabled: false };
    if (search) {
      query.productName = { $regex: '.*' + search + '.*', $options: 'i' };
    }
    if (categoryName) {
      query.productCategory = categoryName;
    }

    // Pagination
    let page = +req.query.page || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const count = await Product.countDocuments(query);
    // console.log(products,"1111111111111");
    if (req.session.user != undefined) {
      let data = req.session.user;
      res.render('product_list', {
        products,
        carousels: banners,
        userData: data,
        categoryName: categoryName,
        sort,
        search,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } else {
      res.render('product_list', {
        products,
        carousels: banners,
        categoryName: categoryName,
        sort,
        search,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadFullProducts = async (req, res) => {
  try {
    const carousels = await Carousel.find();
    const categories = await Category.find();

    // Searching
    const search = req.query.search || '';
    const query = { isDisabled: false };
    if (search) {
      query.productName = { $regex: '.*' + search + '.*', $options: 'i' };
    }

    // Category selection 
    const category = req.query.category || '';
    if (category) {
      query.productCategory = category;
    }

    // Sorting
    const sort = req.query.sort || '';
    let sortOption = {};
    if (sort === 'price_low') {
      sortOption = { price: 1 }; // Sort by price in ascending order
      // console.log(sortOption,"--------------lowToHigh");
    } else if (sort === 'price_high') {
      sortOption = { price: -1 }; // Sort by price in descending order
    }

    // Pagination
    const page = +req.query.page || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const count = await Product.countDocuments(query);

    if (req.session.user != undefined) {
      const data = req.session.user;
      res.render('fullProductsList', {
        products,
        carousels,
        userData: data,
        categories,
        sort,
        search,
        category,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } else {
      res.render('fullProductsList', {
        products,
        carousels,
        categories,
        sort,
        search,
        category,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    }
  } catch (error) {
    console.log(error);
  }
};



// const cancelOrder = async (req, res) => {
//   try {
//     // console.log('inside cancel order');
//     let id = req.query.id;
//     const orderDetails = await Order.findById({ _id: id })
//     // console.log(orderDetails, "---------------orderDetails--------");
//     orderDetails.status = "Cancelled";
//     await orderDetails.save();

//     const userData = req.session.user;

//     if (!userData) {
//       throw new Error('User data not found');
//     }
//     const user = await User.findById(userData._id);
//     if (!user) {
//       throw new Error('User not found');
//     }
//     // console.log(user.wallet);
//     // console.log(user.wallet.balance);
//     // console.log(orderDetails.total);
//     if (orderDetails.paymentMethod === 'gpay' || orderDetails.paymentMethod === 'wallet' || orderDetails.paymentMethod === 'cod') {
//       user.wallet.balance = user.wallet.balance + orderDetails.usedWallet;
//       await User.findByIdAndUpdate(userData._id, { 'wallet.balance': user.wallet.balance }, { new: true });
//       const transaction = {
//         date: new Date(),
//         details: `Cancelled Order - ${orderDetails.orderId}`,
//         amount: orderDetails.total,
//         status: "Credit",
//       };
//       await User.findByIdAndUpdate(userData._id, { $push: { "wallet.transactions": transaction } }, { new: true })
//     }
//     // await user.save();
//     // console.log(result,"Result----------");
//     res.send("Your Order has been Cancelled")
//   } catch (error) {
//     console.log(error);
//   }
// }

const cancelOrder = async (req, res) => {
  try {
    let id = req.query.id;
    const orderDetails = await Order.findById({ _id: id });
    orderDetails.status = "Cancelled";
    await orderDetails.save();

    const userData = req.session.user;

    if (!userData) {
      throw new Error('User data not found');
    }
    const user = await User.findById(userData._id);
    if (!user) {
      throw new Error('User not found');
    }

    if (orderDetails.paymentMethod === 'gpay' || orderDetails.paymentMethod === 'wallet' || orderDetails.paymentMethod === 'cod') {
      user.wallet.balance = user.wallet.balance + orderDetails.usedWallet;
      await user.save();
      const transaction = {
        date: new Date(),
        details: `Cancelled Order - ${orderDetails.orderId}`,
        amount: orderDetails.total,
        status: "Credit",
      };
      await User.findByIdAndUpdate(userData._id, { $push: { "wallet.transactions": transaction } }, { new: true });
    }

    // Increment stock count for each product in the cancelled order
    for (const productInfo of orderDetails.product) {
      const productId = productInfo.id;
      const quantity = productInfo.quantity;

      const product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      product.stockCount += quantity; // Increment stock count based on the quantity cancelled
      await product.save();
    }

    res.send("Your Order has been Cancelled");
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred");
  }
};


const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const { totalAmount } = req.body;
    const data = req.session.user;
    const validCoupon = await Coupon.findOne({ couponCode: couponCode })
    // console.log(validCoupon,"--------------------ValidCoupon--------------");
    if (validCoupon === null) {
      throw new Error("Invalid Coupon")
    }
    else {
      if (totalAmount >= 3000) {
        // const user=await User.findById(data._id)
        // validCoupon.usedBy.push(user);
        var discountAmount = validCoupon.discountAmount
        var updatedTotal = totalAmount - validCoupon.discountAmount;
        res.status(200).json({ updatedTotal, discountAmount });
      }
      else {
        var updatedTotal = totalAmount;
        var p = 'A Minimum purchase of 3000 required for applying the coupon'
        res.status(200).json({ updatedTotal, p });
      }
    }

  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }

}

const returnOrder = async (req, res) => {
  try {
    const orderId = req.query.id;
    const orderDetails = await Order.findById(orderId);
    orderDetails.status = "Returned";
    await orderDetails.save();

    const userData = req.session.user;
    if (!userData) {
      throw new Error('User data not found');
    }
    const user = await User.findById(userData._id);
    if (!user) {
      throw new Error('User not found');
    }
    user.wallet.balance = user.wallet.balance + orderDetails.total;
    await user.save();

    const transaction = {
      date: new Date(),
      details: `Returned Order - ${orderDetails.orderId}`,
      amount: orderDetails.total,
      status: "Credit",
    };
    await User.findByIdAndUpdate(userData._id, { $push: { "wallet.transactions": transaction } }, { new: true });

    // Increment stock count for each product in the returned order
    for (const productInfo of orderDetails.product) {
      const productId = productInfo.id;
      const quantity = productInfo.quantity;

      const product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      product.stockCount += quantity; // Increment stock count based on the quantity returned
      await product.save();
    }

    res.send("Your Return request is processed and updated in the wallet");
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred");
  }
};


// const returnOrder = async (req, res) => {
//   try {
//     const orderId = req.query.id;
//     const orderDetails = await Order.findById(orderId);
//     // console.log(orderDetails, "---------------orderDetails--------");
//     orderDetails.status = "Returned";

//     await orderDetails.save();

//     const userData = req.session.user;
//     if (!userData) {
//       throw new Error('User data not found');
//     }
//     const user = await User.findById(userData._id);
//     if (!user) {
//       throw new Error('User not found');
//     }
//     // console.log(user.wallet);
//     // console.log(user.wallet.balance);
//     // console.log(orderDetails.total);
//     user.wallet.balance = user.wallet.balance + orderDetails.total;
//     await user.save();
//     const transaction = {
//       date: new Date(),
//       details: `Returned Order - ${orderDetails.orderId}`,
//       amount: orderDetails.total,
//       status: "Credit",
//     };
//     await User.findByIdAndUpdate(userData._id, { $push: { "wallet.transactions": transaction } }, { new: true })

//     res.send("Your Return request is processed and updated in the wallet");
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("An error occurred");
//   }
// };

const loadAddresses = async (req, res) => {
  try {
    userData = req.session.user;
    if (userData !== undefined) {
      const shippingAddresses = await ShippingAddress.find({ userId: userData._id })
      const billingAddresses = await BillingAddress.find({ userId: userData._id })
      // console.log(billingAddresses);
      // console.log(shippingAddresses);
      res.render('addresses', { billingAddresses, shippingAddresses, userData })
    }
  } catch (error) {
    console.log(error);
  }
}

const saveBillingAddress = async (req, res) => {
  try {
    console.log("Hi Billing Address");
    const id = req.body.billingId;
    userData = req.session.user;

    if (userData !== undefined) {

      await BillingAddress.findByIdAndUpdate({ _id: id }, {
        name: req.body.name,
        mobile: req.body.mobileNumber,
        addressLine: req.body.addressLine,
        city: req.body.city,
        email: req.body.email,
        state: req.body.state,
        pincode: req.body.pincode,
        is_default: false
      })
      const billingAddresses = await BillingAddress.find({ userId: userData._id })
      const shippingAddresses = await ShippingAddress.find({ userId: userData._id })
      res.render("addresses", { billingAddresses, shippingAddresses, userData })
      // console.log(BillingAddress, "------------edited--------------------");
    }
  } catch (error) {
    console.log(error);
  }
}

const saveBillingAddressinCheckout = async (req, res) => {
  try {
    console.log("Hi Billing Address in checkout");
    const id = req.body.billingId;
    userData = req.session.user;
    const userobj = await User.findOne({ _id: userData._id })
    var couponData = await Coupon.find({ usedBy: { $ne: userData._id } });
    const userWithCartDetails = await User.findById(userData._id)
      .populate({
        path: 'cart',
        populate: {
          path: 'products',
        },
      });
    const productsCheck = userWithCartDetails.cart.map(item => ({
      products: item.products,
      quantity: item.quantity
    }));

    // console.log(productsCheck); // Array of product values
    var subtotal = 0;
    productsCheck.forEach(val => {
      if (val.products) {
        val.total = val.products.price * val.quantity;
        subtotal += val.total;
      }
    });
    // console.log(productsCheck,"---------------------productsCheck---------------------------");
    // console.log(productsCheck.length,'product length')
    if (productsCheck.length == 0) {
      // console.log('inside if')
      // res.json('empty')
      res.status(404).send();
      // res.redirect('/empty-cart');
    }

    if (userData !== undefined) {

      await BillingAddress.findByIdAndUpdate({ _id: id }, {
        name: req.body.name,
        mobile: req.body.mobileNumber,
        addressLine: req.body.addressLine,
        city: req.body.city,
        email: req.body.email,
        state: req.body.state,
        pincode: req.body.pincode,
        is_default: false
      })
      const billingAddresses = await BillingAddress.find({ userId: userData._id })
      const shippingAddresses = await ShippingAddress.find({ userId: userData._id })
      res.render("checkout", { billingAddresses, shippingAddresses, userData, couponData, products: productsCheck, subtotal,walletamount:userobj.wallet.balance })
      // console.log(BillingAddress, "------------edited--------------------");
    }
  } catch (error) {
    console.log(error);
  }
}

const saveShippingAddress = async (req, res) => {
  try {
    console.log("Hi Shipping Address");
    const id = req.body.shippingId;
    userData = req.session.user;
    if (userData !== 'undefined') {
      await ShippingAddress.findByIdAndUpdate({ _id: id }, {
        name: req.body.name,
        mobile: req.body.mobileNumber,
        addressLine: req.body.addressLine,
        city: req.body.city,
        email: req.body.email,
        state: req.body.state,
        pincode: req.body.pincode,
        is_default: false
      })
      const billingAddresses = await BillingAddress.find({ userId: userData._id })
      const shippingAddresses = await ShippingAddress.find({ userId: userData._id })
      res.render("addresses", { billingAddresses, shippingAddresses, userData })
      // console.log(BillingAddress, "------------edited--------------------");
    }
  } catch (error) {
    console.log(error);
  }
}

const saveShippingAddressinCheckout = async (req, res) => {
  try {
    console.log("Hi Shipping Address in checkout");
    const id = req.body.shippingId;
    userData = req.session.user;
    const userobj = await User.findOne({ _id: userData._id })
    var couponData = await Coupon.find({ usedBy: { $ne: userData._id } });
    const userWithCartDetails = await User.findById(userData._id)
      .populate({
        path: 'cart',
        populate: {
          path: 'products',
        },
      });
    const productsCheck = userWithCartDetails.cart.map(item => ({
      products: item.products,
      quantity: item.quantity
    }));

    // console.log(productsCheck); // Array of product values
    var subtotal = 0;
    productsCheck.forEach(val => {
      if (val.products) {
        val.total = val.products.price * val.quantity;
        subtotal += val.total;
      }
    });
    // console.log(productsCheck,"---------------------productsCheck---------------------------");
    // console.log(productsCheck.length,'product length')
    if (productsCheck.length == 0) {
      // console.log('inside if')
      // res.json('empty')
      res.status(404).send();
      // res.redirect('/empty-cart');
    }

    if (userData !== undefined) {

      await ShippingAddress.findByIdAndUpdate({ _id: id }, {
        name: req.body.name,
        mobile: req.body.mobileNumber,
        addressLine: req.body.addressLine,
        city: req.body.city,
        email: req.body.email,
        state: req.body.state,
        pincode: req.body.pincode,
        is_default: false
      })
      const billingAddresses = await BillingAddress.find({ userId: userData._id })
      const shippingAddresses = await ShippingAddress.find({ userId: userData._id })
      res.render("checkout", { billingAddresses, shippingAddresses, userData, couponData, products: productsCheck, subtotal,walletamount:userobj.wallet.balance })
      // console.log(ShippingAddress, "------------edited--------------------");
    }
  } catch (error) {
    console.log(error);
  }
}

const loadeditDetails = async (req, res) => {
  try {
    if (req.session.user != undefined) {
      let data = req.session.user;
      res.render('editDetails', { userData: data })
    }
    else {
      res.redirect('/home')
    }
  } catch (error) {
    console.log(error);
  }
}

const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.query.id;

    // Retrieve the necessary data from the database based on the order ID
    const orderDetails = await Order.findOne({ _id: orderId });

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${orderId}.pdf"`);

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Define colors
    const violetColor = '#7E53C1';
    const greyColor = '#757575';
    const whiteColor = '#FFFFFF';

    // Add content to the PDF document
    doc.font('Helvetica-Bold').fontSize(24).fillColor(violetColor).text('Invoice', { align: 'center' });
    doc.moveDown();

    // Add order details
    doc.font('Helvetica-Bold').fontSize(16).fillColor(violetColor).text('Order Details');
    doc.moveDown();
    doc.font('Helvetica').fontSize(12).fillColor(greyColor);
    doc.text(`Order ID: ${orderDetails.orderId}`);
    doc.text(`Total: ${orderDetails.total}`);
    doc.text(`Payment Method: ${orderDetails.paymentMethod}`);
    doc.text(`Status: ${orderDetails.status}`);
    doc.text(`Order Date: ${orderDetails.date}`);
    doc.moveDown();

    // Add product details
    doc.font('Helvetica-Bold').fontSize(16).fillColor(violetColor).text('Product Details');
    doc.moveDown();
    doc.font('Helvetica').fontSize(12).fillColor(greyColor);
    orderDetails.product.forEach((product, index) => {
      doc.text(`Product ${index + 1}: ${product.name}`);
      doc.text(`Price: ${product.price}`);
      doc.text(`Quantity: ${product.quantity}`);
      doc.moveDown();
    });

    // Add billing address
    doc.font('Helvetica-Bold').fontSize(16).fillColor(violetColor).text('Billing Address');
    doc.moveDown();
    doc.font('Helvetica').fontSize(12).fillColor(greyColor);
    const billingAddress = await BillingAddress.findOne({ _id: orderDetails.billingaddress });
    doc.text(`Name: ${billingAddress.name}`);
    doc.text(`Mobile: ${billingAddress.mobile}`);
    doc.text(`Email: ${billingAddress.email}`);
    doc.text(`Address Line: ${billingAddress.addressLine}`);
    doc.text(`City: ${billingAddress.city}`);
    doc.text(`State: ${billingAddress.state}`);
    doc.text(`Pincode: ${billingAddress.pincode}`);
    doc.moveDown();

    // Add shipping address
    doc.font('Helvetica-Bold').fontSize(16).fillColor(violetColor).text('Shipping Address');
    doc.moveDown();
    doc.font('Helvetica').fontSize(12).fillColor(greyColor);
    const shippingAddress = await ShippingAddress.findOne({ _id: orderDetails.shippingaddress });
    doc.text(`Name: ${shippingAddress.name}`);
    doc.text(`Mobile: ${shippingAddress.mobile}`);
    doc.text(`Email: ${shippingAddress.email}`);
    doc.text(`Address Line: ${shippingAddress.addressLine}`);
    doc.text(`City: ${shippingAddress.city}`);
    doc.text(`State: ${shippingAddress.state}`);
    doc.text(`Pincode: ${shippingAddress.pincode}`);
    doc.moveDown();

    // Finalize the PDF document
    doc.end();
  } catch (error) {
    console.log(error);
    res.status(500).send('Failed to download invoice');
  }
};



// const downloadInvoice = async (req, res) => {
//   try {
//     const orderId = req.query.id;
//     console.log(orderId,"---------------oid----------------");
//     console.log(typeof(orderId),"sdfghjkl");
//     // Retrieve the necessary data from the database based on the order ID
//     const orderDetails=await Order.findOne({_id:orderId})
//     console.log(orderDetails,"op-y");
//     // const orderData = await Order.findById(orderId).populate('billingaddress').populate('shippingaddress');
//     // console.log(orderData,"----------------od================");

//     // Create a new PDF document
//     const doc = new PDFDocument();

//     // Set response headers for PDF download
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename="invoice_${orderId}.pdf"`);

//     // Pipe the PDF document to the response
//     doc.pipe(res);

//     // Add content to the PDF document
//     doc.font('Helvetica-Bold').fontSize(24).text('Invoice', { align: 'center' });
//     doc.moveDown();

//     // Add order details
//     doc.font('Helvetica-Bold').fontSize(16).text('Order Details');
//     doc.moveDown();
//     doc.text(`Order ID: ${orderDetails.orderId}`);
//     doc.text(`Total: ${orderDetails.total}`);
//     doc.text(`Payment Method: ${orderDetails.paymentMethod}`);
//     doc.text(`Status: ${orderDetails.status}`);
//     doc.text(`Order Date: ${orderDetails.date}`);
//     doc.moveDown();

//     // Add product details
//     doc.font('Helvetica-Bold').fontSize(16).text('Product Details');
//     doc.moveDown();
//     orderDetails.product.forEach((product, index) => {
//       doc.text(`Product ${index + 1}: ${product.name}`);
//       doc.text(`Price: ${product.price}`);
//       doc.text(`Quantity: ${product.quantity}`);
//       doc.moveDown();
//     });

//     // Add billing address
//     doc.font('Helvetica-Bold').fontSize(16).text('Billing Address');
//     doc.moveDown();
//     const billingAddress = await BillingAddress.findOne({_id:orderDetails.billingaddress});
//     // console.log(billingAddress,"-------------------biA--------------");
//     doc.text(`Name: ${billingAddress.name}`);
//     doc.text(`Mobile: ${billingAddress.mobile}`);
//     doc.text(`Email: ${billingAddress.email}`);
//     doc.text(`Address Line: ${billingAddress.addressLine}`);
//     doc.text(`City: ${billingAddress.city}`);
//     doc.text(`State: ${billingAddress.state}`);
//     doc.text(`Pincode: ${billingAddress.pincode}`);
//     doc.moveDown();

//     // Add shipping address
//     doc.font('Helvetica-Bold').fontSize(16).text('Shipping Address');
//     doc.moveDown();
//     const shippingAddress = await ShippingAddress.findOne({_id:orderDetails.shippingaddress});
//     // console.log(shippingAddress,"-------------------shA");
//     doc.text(`Name: ${shippingAddress.name}`);
//     doc.text(`Mobile: ${shippingAddress.mobile}`);
//     doc.text(`Email: ${shippingAddress.email}`);
//     doc.text(`Address Line: ${shippingAddress.addressLine}`);
//     doc.text(`City: ${shippingAddress.city}`);
//     doc.text(`State: ${shippingAddress.state}`);
//     doc.text(`Pincode: ${shippingAddress.pincode}`);
//     doc.moveDown();

//     // Finalize the PDF document
//     doc.end();
//   } catch (error) {
//     console.log(error);
//     res.status(500).send('Failed to download invoice');
//   }
// };

module.exports = {
  loadLogin,
  loadSignUp,
  loadHome,
  loadVerifyOtp,
  sendOtp,
  verifyOtp,
  verifyLogin,
  loadLogOut,
  loadOtpLogIn,
  otpLogin,
  loadOtpVerify,
  sendOTPByEmail,
  otpCheck,
  loadProductList,
  loadProductDetail,
  loadProductRatingForm,
  saveProductRatingtoDB,
  loadWishlist,
  addWishList,
  removeProductFromWishList,
  addToCart,
  loadCart,
  removeProductFromCartList,
  quantityChange,
  loadCheckOut,
  addBillingAddress,
  addShippingAddress,
  setBillingAddress,
  setShippingAddress,
  placeOrder,
  loadConfirmation,
  loadProfile,
  loadMyOrders,
  loadOrderDetails,
  loadFullProducts,
  cancelOrder,
  returnOrder,
  loadAddresses,
  saveBillingAddress,
  saveShippingAddress,
  saveBillingAddressinCheckout,
  saveShippingAddressinCheckout,
  applyCoupon,
  loadeditDetails,
  downloadInvoice
}
