const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const ejs = require('ejs')
const fs = require('fs');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;


const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Carousel = require('../models/carouselModel')
const { Logger } = require('sass');
const Order = require('../models/orderModel')
const BillingAddress = require('../models/billingAddressModel')
const ShippingAddress = require('../models/shippingAddressModel');
const { request } = require('express');
const Coupon = require('../models/couponModel')
const Offer = require('../models/offerModel');
const cloudinary = require('cloudinary')
const PDFDocument = require('pdfkit');


//loading Add Category Page
const loadCategoryRegister = async (req, res) => {
    try {
        res.render('addCategory')
    } catch (error) {
        console.log(error);
    }
}

//loading Add Coupon Page
const loadCouponRegister = async (req, res) => {
    try {
        res.render('addCoupon')
    } catch (error) {
        console.log(error);
    }
}

//loading Add Products Page
const loadProductRegister = async (req, res) => {
    try {
        const categoryData = await Category.find({})
        res.render('addProduct', { category: categoryData })
    } catch (error) {
        console.log(error);
    }
}

const productOfferCreate = async (req, res) => {
    try {
        // console.log("Hi------ProdOffer------------");
        const productData = await Product.find({});
        res.render("adminProductOfferCreate", {
            data: productData,
        });
    } catch (error) {
        console.log(error.message);
    }
};

const categoryOfferCreate = async (req, res) => {
    try {
        const categoryData = await Category.find({});
        res.render("adminCategoryOfferCreate", {
            data: categoryData,
        });
    } catch (error) {
        console.log(error.message);
    }
};


//loading Add Carousel Page
const loadCarouselRegister = async (req, res) => {
    try {
        const carouselData = await Carousel.find({})
        res.render('addCarousel', { carouselData })
    } catch (error) {
        console.log(error);
    }
}

//loading Categories Page
const loadCategories = async (req, res) => {
    try {
        // console.log("hiiiiiiiiiiii");
        const categoryData = await Category.find()
        // console.log("check1================", categoryData);
        res.render('categories', { categories: categoryData })
    } catch (error) {
        console.log(error);
    }
}

const offerlistload = async (req, res) => {
    try {
        const offerdata = await Offer.find();
        if (offerdata.length > 0) {
            res.render("offers", { offers: offerdata, text: "" });
        } else {
            res.render("offers", { offers: offerdata, text: "No offers have been added" });
        }
    } catch (error) {
        console.log(error.message);
    }
};



//loading Coupons Page
const loadCoupons = async (req, res) => {
    try {
        // console.log("hiiiiiiiiiiii");
        const couponData = await Coupon.find()
        // console.log("check1================", couponData);
        res.render('coupons', { coupons: couponData })
    } catch (error) {
        console.log(error);
    }
}

//loading Products Page
const loadProducts = async (req, res) => {
    try {
        // console.log("hiiiiiiiiiiii");
        const productData = await Product.find()
        // console.log("check1",productData);
        // console.log("pro", productData)
        // console.log(productData[0].imageUrls[0].url, "2222222222222222222222222");
        res.render('products', { products: productData })
    } catch (error) {
        console.log(error);
    }
}

//loading Login Page
const loadLogin = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error);
    }
}

//loading Admin Home Page
const loadadminHome = async (req, res) => {
    try {
        res.render('home')
    } catch (error) {
        console.log(error);
    }
}

//loading Users Page
const loadUsers = async (req, res) => {
    try {
        const userData = await User.find({ isAdmin: 0 });
        // console.log(userData);
        res.render("users", { users: userData });
    } catch (error) {
        console.log(error.message);
    }
};

const loadOrders = async (req, res) => {
    try {
        const orderData = await Order.find({})
        // res.render('orders',{orderData:orderData})
        // console.log(orderData);
        // console.log(orderData[0].status);
        let statusOptions = [];
        statusOptions = Order.schema.path("status").enumValues
        // console.log(statusOptions);
        res.render("orders", { orderData: orderData, statusOptions: statusOptions });
    } catch (error) {
        console.log(error.message);
    }
}

const loadOrderDetails = async (req, res) => {
    try {

        const orderId = req.query.orderId
        // console.log(orderId);
        // console.log(typeof(orderId));
        const orderData = await Order.find({ orderId: orderId })
        // console.log(orderData,"--------orderdata----------");
        // console.log(orderData[0].userId);
        const userData = await User.find({ _id: orderData[0].userId })
        // console.log(userData,"-------------userData----------");
        const BillingAddressDetail = await BillingAddress.findById(orderData[0].billingaddress);
        // console.log(BillingAddressDetail,"-----------BillingAddressDetail-------------");
        const ShippingAddressDetail = await ShippingAddress.findById(orderData[0].shippingaddress);
        // console.log(ShippingAddressDetail,"--------------ShippingAddressDetail---------------");

        res.render('fullOrderDetails', { userData: userData, orderData: orderData, BillingAddress: BillingAddressDetail, ShippingAddress: ShippingAddressDetail })
        // console.log(orderData);
    } catch (error) {
        console.log(error);
    }
}
//loading Carousel Page
const loadCarousel = async (req, res) => {
    try {
        const carouselData = await Carousel.find();
        // console.log(carouselData);
        res.render("carousels", { carousels: carouselData });
    } catch (error) {
        console.log(error.message);
    }
};



//Changing the Block-Unblock Status for the User
const changeStatus = async (req, res) => {
    try {

        const userId = req.body.userId
        const action = req.body.action
        // console.log(userId);
        // console.log(action);
        const user = await User.findOne({ _id: userId })
        // console.log(user);
        if (action == 'block') {
            user.blockStatus = true;
            // req.session.user=null;
            // delete req.session.user;
            await user.save();
        }
        else {
            user.blockStatus = false;
            await user.save();
        }
        res.json({ success: true, message: 'Block status updated successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

//Changing the Enable-Disable Status for the Category

const disableOrEnableCategory = async (req, res) => {
    try {
        // console.log("hitting Disable=======================================================");
        const { categoryId, action } = req.body;
        // const categoryname=req.body.categoryName
        // const action=req.body.action

        // console.log("Hello", action);
        const category = await Category.findById(categoryId)
        // console.log("Hi" + category);
        if (action == 'Disable') {
            category.isDisabled = true;
        }
        else {
            category.isDisabled = false;
        }
        await category.save();
        res.json({ success: true, message: 'Disable status updated successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const disableOrEnableCoupon = async (req, res) => {
    try {
        // console.log("hitting Disable=======================================================");
        const { couponId, action } = req.body;
        // const couponname=req.body.couponName
        // const action=req.body.action

        // console.log("Hello", action);
        const coupon = await Coupon.findById(couponId)
        // console.log("Hi" + coupon);
        if (action == 'Disable') {
            coupon.isDisabled = true;
        }
        else {
            coupon.isDisabled = false;
        }
        await coupon.save();
        res.json({ success: true, message: 'Disable status updated successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

//Changing the Enable-Disable Status for the Carousel

const disableOrEnableCarousel = async (req, res) => {
    try {
        // console.log("hitting Disable=======================================================");
        const { carouselId, action } = req.body;
        // const categoryname=req.body.categoryName
        // const action=req.body.action

        // console.log("Hello", action);
        const carousel = await Carousel.findById(carouselId)
        // console.log("Hi" + category);
        if (action == 'Disable') {
            carousel.isDisabled = true;
        }
        else {
            carousel.isDisabled = false;
        }
        await carousel.save();
        res.json({ success: true, message: 'Disable status updated successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


//Changing the Enable-Disable Status for the Product
const disableOrEnableProduct = async (req, res) => {
    try {
        // console.log("hitting Disable=======================================================");
        const { productId, action } = req.body;
        // console.log("Hello", action);
        const product = await Product.findById(productId)
        // console.log("Hi" + product);
        if (action == 'Disable') {
            product.isDisabled = true;
        }
        else {
            product.isDisabled = false;
        }
        await product.save();
        res.json({ success: true, message: 'Disable status updated successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

//Loading the Edit Carousel Page and Passing the current Carousel-data to the page
const editLoadCarousel = async (req, res) => {
    try {
        const id = req.query.id;
        req.session.editCarouselId = req.query.id;
        const carouselData = await Carousel.find({ _id: id })
        res.render('editCarousel', { carousels: carouselData })
    } catch (error) {
        console.log(error);
    }
}


//Loading the Edit Category Page and Passing the current Category-data to the page
const editLoadCategory = async (req, res) => {
    try {
        const id = req.query.id;
        req.session.editCategoryId = req.query.id;
        // console.log("Hi---------",id);
        const categoryData = await Category.find({ _id: id })
        //  console.log("Hi hitting Edit load------",categoryData);
        res.render('editCategory', { category: categoryData })
    } catch (error) {
        console.log(error);
    }
}

const editLoadCoupon = async (req, res) => {
    try {
        const id = req.query.id;
        req.session.editCouponId = req.query.id;
        // console.log("Hi---------",id);
        const couponData = await Coupon.find({ _id: id })
        //  console.log("Hi hitting Edit load------",couponData);
        // console.log(couponData,"----------------cd------------");

        // Convert startDate and endDate to strings in "YYYY-MM-DD" format
        const startDate = couponData[0].startDate.toISOString().split('T')[0];
        const endDate = couponData[0].endDate.toISOString().split('T')[0];

        res.render('editCoupon', { coupon: couponData, startDate: startDate, endDate: endDate })

    } catch (error) {
        console.log(error);
    }
}

//Loading the Edit Load Page and Passing the current Product-data to the page
const editLoadProduct = async (req, res) => {
    try {
        const id = req.query.id;
        req.session.editProductId = req.query.id;
        const productData = await Product.find({ _id: id })
        const categoryData = await Category.find()
        // console.log(categoryData);
        // console.log(productData[0].imageUrls, "333333333333333");
        res.render('editProduct', { product: productData, category: categoryData })
    } catch (error) {
        console.log(error);
    }
}

//Updating the Category Details
const updateCategory = async (req, res) => {
    try {
        // console.log('update api here')
        const id = req.session.editCategoryId;
        const name = req.body.categoryName;
        const description = req.body.categoryDescription;

        const files = req.files;
        const categoryImage = [];

        if (files && files.length > 0) {
            files.forEach((file) => {
                const image = file.filename;
                categoryImage.push(image);
            });
        } else {
            const existingCategory = await Category.findById(id);
            categoryImage.push(existingCategory.categoryImage[0]);
        }

        await Category.findByIdAndUpdate({ _id: id }, { $set: { categoryName: name, categoryDescription: description, categoryImage } });
        res.redirect('/admin/categories')
    } catch (error) {
        console.log(error);
    }
}

//Updating the Coupon Details
const updateCoupon = async (req, res) => {
    try {
        // console.log('update coupon here')
        const id = req.session.editCouponId;
        const couponName = req.body.couponName;
        const couponCode = req.body.couponCode;
        const discountAmount = req.body.discountAmount;
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;

        await Coupon.findByIdAndUpdate({ _id: id }, { $set: { couponName: couponName, couponCode: couponCode, discountAmount: discountAmount, startDate: startDate, endDate: endDate } });
        res.redirect('/admin/coupons')
    } catch (error) {
        console.log(error);
    }
}

//Updating the Carousel Details
const updateCarousel = async (req, res) => {

    try {
        const id = req.session.editCarouselId;
        // console.log("Hi here-------------------------------");
        const name = req.body.carouselName;
        const description = req.body.carouselDescription;

        const files = req.files;
        const carouselImages = [];

        files.forEach((file) => {
            const image = file.filename;
            carouselImages.push(image);
        });

        await Carousel.findByIdAndUpdate({ _id: id }, { $set: { carouselName: name, carouselDescription: description, carouselImages: carouselImages } })
        res.redirect('/admin/carousels')
    } catch (error) {
        console.log(error);
    }
}

//Updating the Product Details
// const updateProduct = async (req, res) => {

//     try {
//         const id = req.session.editProductId;
//         const existingProduct = await Product.findById(id);

//         // console.log("Hi here-------------------------------");
//         const name = req.body.productName;
//         const productCategory = req.body.productCategory
//         const description = req.body.productDescription;
//         const price = req.body.price;
//         const count = req.body.stockCount;
//         const productBrand = req.body.productBrand

//         const files = req.files;
//         const productImages = [];

//         if (files && files.length > 0) {
//             files.forEach((file) => {
//                 const image = file.filename;
//                 productImages.push(image);
//             });
//         } else {
//             productImages.push(existingProduct.imageUrls[0]);
//         }

//         await Product.findByIdAndUpdate({ _id: id }, { $set: { productName: name, productDescription: description, productCategory: productCategory, price: price, stockCount: count, imageUrls: productImages, productBrand: productBrand } })
//         res.redirect('/admin/products')
//     } catch (error) {
//         console.log(error);
//     }
// }

const updateProduct = async (req, res) => {
    try {
        const categoryData = await Category.find()
        const id = req.session.editProductId;
        const existingProduct = await Product.findById(id);

        const name = req.body.productName;
        const productCategory = req.body.productCategory;
        const description = req.body.productDescription;
        const price = req.body.price;
        const count = req.body.stockCount;
        const productBrand = req.body.productBrand;

        const files = req.files;
        const productImages = [...existingProduct.imageUrls]; // Create a copy of existing images

        // Upload image to Cloudinary


        if (files && files.length > 0) {
            for (const file of files) {
                const image = file.path;
                const result = await cloudinary.uploader.upload(image, {
                    folder: "Products"
                });
                productImages.push({
                    public_id: result.public_id,
                    url: result.secure_url
                });
            };
        }

        await Product.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    productName: name,
                    productDescription: description,
                    productCategory: productCategory,
                    price: price,
                    stockCount: count,
                    imageUrls: productImages,
                    productBrand: productBrand,
                },
            }
        );
        //   res.redirect('/admin/products');
        // Refresh the existingProduct variable with the updated data
        const updatedProduct = await Product.findById(id);
        res.render('editProduct', { product: [updatedProduct], category: categoryData });
    } catch (error) {
        console.log(error);
    }
};

const addProductOffer = async (req, res) => {
    try {
        const offerName = req.body.name;
        const offerPercentage = parseInt(req.body.percentage, 10);
        // console.log(offerPercentage, "------------------op-------------------");
        const product = req.body.product;
        if (!offerName || !offerPercentage || !product) {
            return res.status(400).send("Missing required fields");
        }
        const lowerOfferName = offerName.toLowerCase();
        const offerExist = await Offer.findOne({ name: lowerOfferName });
        if (!offerExist) {
            const existingProduct = await Product.findById(product);
            const originalProductPrice = existingProduct.offerPrice;
            const newPrice = Math.round(originalProductPrice * ((100 - (existingProduct.offerPercentage + offerPercentage)) / 100));

            console.log("Original Product Price:", originalProductPrice);
            console.log("New Price:", newPrice);
            await Product.findByIdAndUpdate(product, { $set: { price: newPrice } });
            await Product.findByIdAndUpdate(product, { $set: { offerPercentage: existingProduct.offerPercentage + offerPercentage } });
            const newOffer = new Offer({
                name: offerName,
                percentage: offerPercentage,
                product: product,
            });
            await newOffer.save();
            res.redirect("/admin/offers");
        } else {
            res.redirect("/admin/productOfferCreate");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


const addCategoryOffer = async (req, res) => {
    try {
        const offerName = req.body.name;
        const offerPercentage = parseInt(req.body.percentage, 10);
        const category = req.body.category;
        // console.log(category);
        const c = await Category.findById(category)
        // console.log(c.categoryName);
        console.log(offerName, offerPercentage, category, "3 exists-------------");
        if (!offerName || !offerPercentage || !category) {
            return res.status(400).send("Missing required fields");
        }
        const lowerOfferName = offerName.toLowerCase();
        const offerExist = await Offer.findOne({ name: lowerOfferName });
        // console.log(offerExist, "55555555555555555");
        if (!offerExist) {
            console.log("inside !offerExist");
            const products = await Product.find({ productCategory: c.categoryName });
            for (let i = 0; i < products.length; i++) {
                const product = products[i];
                product.price = Math.round(product.offerPrice - (product.offerPrice * (product.offerPercentage + offerPercentage)) / 100);
                product.offerPercentage = product.offerPercentage + offerPercentage;
                await product.save();
                //   console.log(product, "10101010");
            }

            const newOffer = new Offer({
                name: offerName,
                percentage: offerPercentage,
                category: category,
            });
            await newOffer.save();
            res.redirect("/admin/offers");
        } else {
            res.redirect("/admin/categoryOfferCreate");
        }

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


//Log Out Functionality
const loadLogout = async (req, res) => {
    try {
        req.session.user = null;
        res.redirect('/admin')
    } catch (error) {
        console.log(error)
    }
}

//Login Functionality
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        // console.log("emailChecking>>>>>", email);

        // console.log("hellooo");

        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {
                if (userData.isAdmin == 0) {
                    res.render('login', { message: 'User is NOT ADMIN' });
                }
                else {
                    req.session.user = userData._id;
                    res.redirect('/admin/home');
                    // console.log(req.session.user)
                }
            }
            else {
                res.render('login', { message: 'Password is incorrect' })
            }
        }
        else {
            res.render('login', { message: 'Email and password is incorrect' })
        }
    } catch (error) {
        console.log(error.message);
    }
}

//If Category Image is in String type
// const saveCategorytoDB = async (req, res) => {
//     try {
//         const categoryname = req.body.categoryName;
//         const categoryImage = req.file.filename;
//         const categorydescription = req.body.categoryDescription
//         console.log(categoryname);
//         const category = new Category({
//             categoryName: categoryname,
//             categoryImage: categoryImage,
//             categoryDescription: categorydescription
//         });
//         const categoryData = await category.save();
//         console.log(categoryData);
//         res.redirect('/admin/categories')
//     } catch (error) {
//         console.log(error);
//     }
// }

//Adding new Carousel to DataBase

const saveCarouseltoDB = async (req, res) => {
    try {
        const files = req.files;
        const carouselImages = [];

        files.forEach((file) => {
            const image = file.filename;
            carouselImages.push(image);
        });

        const carouselName = req.body.carouselName;
        const carouselDescription = req.body.carouselDescription

        const carousel = new Carousel({
            carouselName: carouselName,
            carouselImages: carouselImages,
            carouselDescription: carouselDescription
        });

        await carousel.save();

        res.redirect('/admin/carousels')
    } catch (error) {
        console.log(error);
    }
}



const saveCoupontoDB = async (req, res) => {
    try {

        // console.log(req.body.couponCode);
        // console.log(req.body.couponName);
        // console.log(req.body.discountAmount);
        // console.log(req.body.startDate);
        // console.log(req.body.endDate);
        const couponName = req.body.couponName;
        const couponCode = req.body.couponCode;
        const discountAmount = req.body.discountAmount;
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;

        // Check if the coupon already exists (case-insensitive)
        const existingCoupon = await Coupon.findOne({
            couponName: { $regex: new RegExp(`^${couponName}$`, 'i') }
        });

        if (existingCoupon) {
            return res.status(400).json({ error: 'Coupon already exists' });
        }

        const coupon = new Coupon({
            couponName: couponName,
            couponCode: couponCode,
            discountAmount: discountAmount,
            startDate,
            endDate
        });

        await coupon.save();
        res.redirect('/admin/coupons');
    } catch (error) {
        console.log(error);
    }
};

// const saveCategorytoDB = async (req, res) => {
//     try {

//         const files =req.files
//         const categoryimage = [];

//         // if (!req.files || !Array.isArray(req.files)) {
//         //     return res.status(400).json({ error: 'No files found' });
//         // }

//         for (const file of files) {
//             const image = file.filename;
//             // Upload image to Cloudinary
//             const result = await cloudinary.uploader.upload(image, {
//                 folder: "Categories"
//             });

//             // Push public_id and url to categoryImage array
//             categoryimage.push({
//                 public_id: result.public_id,
//                 url: result.secure_url}
//             );
//         };

//         const categoryname = req.body.categoryName;
//         const categorydescription = req.body.categoryDescription;

//            // Check if the category already exists (case-insensitive)
//         const existingCategory = await Category.findOne({
//             categoryName: { $regex: new RegExp(`^${categoryname}$`, 'i') }
//         });

//         if (existingCategory) {
//             return res.status(400).json({ error: 'Category already exists' });
//         }

//         const category = new Category({
//             categoryName: categoryname,
//             categoryImage: categoryimage,
//             categoryDescription: categorydescription,
//         });

//         await category.save();
//         res.redirect('/admin/categories');
//     } catch (error) {
//         console.log(error);
//     }
// };

const saveCategorytoDB = async (req, res) => {
    try {
        const files = req.files;
        const categoryimage = [];

        files.forEach((file) => {
            const image = file.filename;
            categoryimage.push(image);
        });

        const categoryname = req.body.categoryName;
        const categorydescription = req.body.categoryDescription;

        // Check if the category already exists (case-insensitive)
        const existingCategory = await Category.findOne({
            categoryName: { $regex: new RegExp(`^${categoryname}$`, 'i') }
        });

        if (existingCategory) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        const category = new Category({
            categoryName: categoryname,
            categoryImage: categoryimage,
            categoryDescription: categorydescription,
        });

        await category.save();
        res.redirect('/admin/categories');
    } catch (error) {
        console.log(error);
    }
};

//Adding new Product to DataBase
const saveProducttoDB = async (req, res) => {
    try {
        const files = req.files;
        const productImages = [];

        for (const file of files) {
            const image = file.path;

            // Upload image to Cloudinary
            const result = await cloudinary.uploader.upload(image, {
                folder: "Products"
            });

            // Push public_id and url to productImages array
            productImages.push({
                public_id: result.public_id,
                url: result.secure_url
            });
        }

        const productname = req.body.productName;
        const productprice = req.body.price;
        const productcategory = req.body.productCategory;
        const productdescription = req.body.productDescription;
        const productquantity = req.body.stockCount;
        const productBrand = req.body.brand;
        const offerPrice = req.body.price;

        // Check if the product already exists
        const existingProduct = await Product.findOne({
            productName: { $regex: new RegExp(`^${productname}$`, "i") }
        });

        if (existingProduct) {
            return res.status(400).json({ error: "Product already exists" });
        }

        const product = new Product({
            productName: productname,
            price: productprice,
            productCategory: productcategory,
            productBrand: productBrand,
            productDescription: productdescription,
            stockCount: productquantity,
            imageUrls: productImages,
            offerPrice: offerPrice
        });

        await product.save();
        res.redirect("/admin/product");
    } catch (error) {
        console.log(error);
    }
};

// const saveProducttoDB = async (req, res) => {
//     try {
//         const files = req.files;
//         const productImages = [];

//         for (const file of files) {
//             const image = file.path;

//             // Upload image to Cloudinary with cropping
//             const result = await uploadImage(image);

//             // Push public_id and url to productImages array
//             productImages.push({
//                 public_id: result.public_id,
//                 url: result.secure_url
//             });
//         }

//         const productname = req.body.productName;
//         const productprice = req.body.price;
//         const productcategory = req.body.productCategory;
//         const productdescription = req.body.productDescription;
//         const productquantity = req.body.stockCount;
//         const productBrand = req.body.brand;
//         const offerPrice = req.body.price;

//         // Check if the product already exists
//         const existingProduct = await Product.findOne({
//             productName: { $regex: new RegExp(`^${productname}$`, "i") }
//         });

//         if (existingProduct) {
//             return res.status(400).json({ error: "Product already exists" });
//         }

//         const product = new Product({
//             productName: productname,
//             price: productprice,
//             productCategory: productcategory,
//             productBrand: productBrand,
//             productDescription: productdescription,
//             stockCount: productquantity,
//             imageUrls: productImages,
//             offerPrice: offerPrice
//         });

//         await product.save();
//         res.redirect("/admin/product");

//     } catch (error) {
//         console.log(error);
//     }
// };

// Function to upload image with cropping
// const uploadImage = (image) => {
//     return new Promise((resolve, reject) => {
//         cloudinary.uploader.upload(
//             image,
//             {
//                 folder: "Products",
//                 width: 400,
//                 height: 600,
//                 crop: "fill",
//             },
//             (error, result) => {
//                 if (error) {
//                     reject(error);
//                 } else {
//                     resolve(result);
//                 }
//             }
//         );
//     });
// };


const deleteCategory = async (req, res) => {
    try {
        const id = new ObjectId(req.query.id);
        await Category.findByIdAndDelete(id);
        res.redirect('/admin/categories');
    } catch (error) {
        console.log(error.message);
    }
}

const deleteCoupon = async (req, res) => {
    try {
        const id = new ObjectId(req.query.id);
        await Coupon.findByIdAndDelete(id);
        res.redirect('/admin/coupons');
    } catch (error) {
        console.log(error.message);
    }
}

const deleteProductOffer = async (req, res) => {
    try {
        const offerDoc = await Offer.findById(req.params.id);
        //   console.log(offerDoc,"+++++++++++++++++++++++++");
        const offerValidProductId = offerDoc.product;
        //   console.log(offerValidProductId,"-------------------------");
        const productData = await Product.findById({ _id: offerValidProductId });
        //   console.log(productData,"======================================");
        const newOffer = productData.offerPercentage - offerDoc.percentage
        const newPrice = (100 - newOffer) * productData.offerPrice / 100
        //   const newPrice=((100+productData.offerPercentage)/100)*productData.offerPrice;
        const previousProductPrice = productData.offerPrice;
        // console.log(previousProductPrice);
        await Product.findByIdAndUpdate({ _id: offerValidProductId }, { $set: { price: newPrice } });
        await Product.findByIdAndUpdate({ _id: offerValidProductId }, { $set: { offerPercentage: newOffer } });
        await Offer.deleteOne({ _id: req.params.id });
        //   const offerdata = await Offer.find();
        //   if(offerdata.length>0){
        //     res.render("offers", { offers: offerdata ,text:""});
        //   }else{
        //     res.render("offers", { offers: offerdata,text:"All offers have been deleted" });
        //   } 
        res.redirect("/admin/offers");
    } catch (error) {
        console.log(error.message);
    }
};


const deleteCategoryOffer = async (req, res) => {
    try {
        const offerDoc = await Offer.findById(req.params.id);
        // console.log(offerDoc,"123456789");
        // console.log(offerDoc.category,"9877");
        const c = await Category.findById(offerDoc.category);
        // console.log(c.categoryName,"[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[");
        const products = await Product.find({ productCategory: c.categoryName });

        products.forEach((product) => {
            const newOffer = product.offerPercentage - offerDoc.percentage;
            const newPrice = (100 - newOffer) * product.offerPrice / 100;

            product.price = newPrice;
            product.offerPercentage = newOffer;
            product.save();
        });

        await Offer.deleteOne({ _id: req.params.id });

        res.redirect("/admin/offers");
    } catch (error) {
        console.log(error.message);
    }
};




const deleteProduct = async (req, res) => {
    try {
        const id = new ObjectId(req.query.id);
        await Product.findByIdAndDelete(id);
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
    }
}


const deleteCarousel = async (req, res) => {
    try {
        const id = new ObjectId(req.query.id);
        await Carousel.findByIdAndDelete(id);
        res.redirect('/admin/carousels');
    } catch (error) {
        console.log(error.message);
    }
}

const updateStatus = async (req, res) => {
    try {
        const selectedStatus = req.body.statusvalue;
        const orderId = new ObjectId(req.body.id);
        const orderData = await Order.findById(orderId)
        // console.log(orderData);
        const userId = orderData.userId
        // console.log(userId);
        const user = await User.findById(userId)
        console.log(user);
        // console.log(req.body,'shijth pk checking body')
        // console.log(selectedStatus,"-----------------selectedStatus--------------");
        // console.log(req.body.id)
        if (selectedStatus == 'Delivered') {
            const deliverDate = new Date();
            await Order.updateOne(
                { _id: orderId }, // Specify the document you want to update
                { $set: { deliveredDate: deliverDate } },
                { new: true } // Set the new value for the field
            );
            const returnEndDate = new Date(deliverDate.getTime() + 5 * 24 * 60 * 60 * 1000); // Add 5 days (5 * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
            await Order.updateOne(
                { _id: orderId }, // Specify the document you want to update
                { $set: { returnEndDate: returnEndDate } },
                { new: true } // Set the new value for the field
            );

            // Push product ids to userModel boughtBy array
            const productIds = orderData.product.map((product) => product.id);
            user.boughtBy.push(...productIds);
            await user.save();
            for (let i = 0; i < productIds.length; i++) {
                const product = await Product.findById(productIds[i]);
                product.boughtBy.push(userId)
                await product.save();
            }
        }
        else { }
        console.log(user);
        // console.log(orderId,"------------orderId-------------");
        // const order=await Order.findOne({ _id:orderId })
        // console.log(order);
        const filter = { _id: orderId };
        const update = { $set: { status: selectedStatus } };
        await Order.updateOne(filter, update)
    } catch (error) {
        console.log(error.message);
    }
};


const removeIndexImage = async (req, res) => {
    try {
        const imageName = req.body.imageUrlName;
        const id = req.body.prodId
        // console.log(imageName);
        // console.log(id, "-------prodId-----------");
        const product = await Product.findById(id)
        // console.log(product, "-----------productDetails-----------");
        for (let i = 0; i < product.imageUrls.length; i++) {
            if (product.imageUrls[i].url === imageName) {
                product.imageUrls.splice(i, 1)
                console.log("Hi success controller-----------");
                await product.save();
                res.json({
                    status: 'success'
                })
            }
        }

    } catch (error) {
        console.log(error);
    }
}



// const updateStatus = async (req, res) => {
//   try {
//     const selectedStatus = req.body.statusvalue;
//     console.log(selectedStatus, "-----------------selectedStatus--------------");
//     const orderId = req.body.id;
//     console.log(orderId, "------------orderId-------------");

//     // if (!orderId) {
//     //   console.log("Invalid orderId:", orderId);
//     //   res.status(400).json({ error: "Invalid orderId." });
//     //   return;
//     // }

//     const filter = { _id: mongoose.Types.ObjectId(orderId) };
//     const update = { $set: { status: selectedStatus } };
//     await Order.updateOne(filter, update);
//     console.log("Status updated successfully.");
//     res.status(200).json({ message: "Status updated successfully." });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ error: "An error occurred while updating status." });
//   }
// };

//working
const generateSalesReport = async (req, res) => {
    try {
      const { startDate, endDate } = req.body;

      // Retrieve the sales data from the database based on the date range
      const salesData = await Order.find({
        date: { $gte: startDate, $lte: endDate },
      }).populate('product.id');

      // Create a new PDF document
      const doc = new PDFDocument();

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="sales_report.pdf"`);

      // Pipe the PDF document to the response
      doc.pipe(res);

      // Sales report title
      doc.font('Helvetica-Bold').fontSize(18).text('Sales Report', { align: 'center' });
      doc.moveDown();

      // Date range
      doc.font('Helvetica').fontSize(14).text(`${startDate} - ${endDate}`, { align: 'center' });
      doc.moveDown();

      // Sales data table header
      doc.font('Helvetica-Bold').fontSize(12).text('Date', { align: 'left' });
      doc.font('Helvetica-Bold').fontSize(12).text('Order ID', { align: 'left' });
      doc.font('Helvetica-Bold').fontSize(12).text('Payment Method', { align: 'left' });
      doc.font('Helvetica-Bold').fontSize(12).text('Product Details', { align: 'left' });
      doc.font('Helvetica-Bold').fontSize(12).text('Total', { align: 'left' });
      doc.moveDown();

      // Sales data table
      salesData.forEach((order) => {
        doc.font('Helvetica').fontSize(12).text(`Date: ${order.date.toDateString()}`, { align: 'left' });
        doc.font('Helvetica').fontSize(12).text(`Order ID: ${order.orderId}`, { align: 'left' });
        doc.font('Helvetica').fontSize(12).text(`Payment Method: ${order.paymentMethod}`, { align: 'left' });

        order.product.forEach((product) => {
          doc.font('Helvetica').fontSize(12).text(`Name: ${product.id.productName}`, { align: 'left' });
          doc.font('Helvetica').fontSize(12).text(`Price: ₹${product.price}`, { align: 'left' });
          doc.font('Helvetica').fontSize(12).text(`Quantity: ${product.quantity}`, { align: 'left' });
          doc.font('Helvetica').fontSize(12).text('', { align: 'left' }); // Add an empty line after each product
        });

        doc.font('Helvetica').fontSize(12).text(`Total: ₹${order.total}`, { align: 'left' });
        doc.moveDown();
      });

      // Finalize the PDF document
      doc.end();
    } catch (error) {
      console.log(error);
      res.status(500).send('Failed to generate sales report');
    }
  };




module.exports = {
    loadLogin,
    verifyLogin,
    loadadminHome,
    loadUsers,
    changeStatus,
    loadLogout,
    loadCategoryRegister,
    disableOrEnableCategory,
    loadCategories,
    saveCategorytoDB,
    editLoadCategory,
    updateCategory,
    deleteCategory,
    loadProducts,
    loadProductRegister,
    saveProducttoDB,
    disableOrEnableProduct,
    deleteProduct,
    updateProduct,
    editLoadProduct,
    saveCarouseltoDB,
    loadCarousel,
    editLoadCarousel,
    updateCarousel,
    deleteCarousel,
    disableOrEnableCarousel,
    loadCarouselRegister,
    loadOrders,
    loadOrderDetails,
    updateStatus,
    removeIndexImage,
    loadCoupons,
    loadCouponRegister,
    saveCoupontoDB,
    disableOrEnableCoupon,
    editLoadCoupon,
    updateCoupon,
    deleteCoupon,
    offerlistload,
    productOfferCreate,
    addProductOffer,
    deleteProductOffer,
    categoryOfferCreate,
    addCategoryOffer,
    deleteCategoryOffer,
    generateSalesReport,

}