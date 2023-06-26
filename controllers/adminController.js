const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const ejs = require('ejs')

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



//loading Add Category Page
const loadCategoryRegister = async (req, res) => {
    try {
        res.render('addCategory')
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

//loading Products Page
const loadProducts = async (req, res) => {
    try {
        // console.log("hiiiiiiiiiiii");
        const productData = await Product.find()
        // console.log("check1",productData);
        // console.log("pro", productData)

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

//Loading the Edit Load Page and Passing the current Product-data to the page
const editLoadProduct = async (req, res) => {
    try {
        const id = req.query.id;
        req.session.editProductId = req.query.id;
        const productData = await Product.find({ _id: id })
        const categoryData = await Category.find()
        // console.log(categoryData);
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
const updateProduct = async (req, res) => {

    try {
        const id = req.session.editProductId;
        // console.log("Hi here-------------------------------");
        const name = req.body.productName;
        const productCategory = req.body.productCategory
        const description = req.body.productDescription;
        const price = req.body.price;
        const count = req.body.stockCount;
        const productBrand = req.body.productBrand

        const files = req.files;
        const productImages = [];

        if (files && files.length > 0) {
            files.forEach((file) => {
                const image = file.filename;
                productImages.push(image);
            });
        } else {
            const existingProduct = await Product.findById(id);
            productImages.push(existingProduct.imageUrls[0]);
        }

        await Product.findByIdAndUpdate({ _id: id }, { $set: { productName: name, productDescription: description, productCategory: productCategory, price: price, stockCount: count, imageUrls: productImages, productBrand: productBrand } })
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error);
    }
}



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
    // console.log('hitting');
    try {
        // console.log(req.body);
        const files = req.files;
        const productimages = [];

        files.forEach((file) => {
            const image = file.filename;
            productimages.push(image);
        });


        const productname = req.body.productName;
        const productprice = req.body.price;
        const productcategory = req.body.productCategory;
        const productdescription = req.body.productDescription;
        const productquantity = req.body.stockCount;
        const productBrand = req.body.brand;

        // console.log(productBrand,"--------------------");
        // console.log(productname);

        // Check if the category already exists (case-insensitive)
        const existingProduct = await Product.findOne({
            productName: { $regex: new RegExp(`^${productname}$`, 'i') }
        });

        if (existingProduct) {
            return res.status(400).json({ error: 'Product already exists' });
        }

        const product = new Product({
            productName: productname,
            price: productprice,
            productCategory: productcategory,
            productBrand: productBrand,
            productDescription: productdescription,
            stockCount: productquantity,
            imageUrls: productimages
        });
        const productData = await product.save();
        // console.log(productData);
        res.redirect('/admin/products')

    } catch (error) {
        console.log(error);
    }
}

const deleteCategory = async (req, res) => {
    try {
        const id = new ObjectId(req.query.id);
        await Category.findByIdAndDelete(id);
        res.redirect('/admin/categories');
    } catch (error) {
        console.log(error.message);
    }
}

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
            for(let i=0;i<productIds.length;i++)
            {
                const product=await Product.findById(productIds[i]);
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
    updateStatus
}