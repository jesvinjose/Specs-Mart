const express = require('express');
const adminRoute = express();
const adminAuth = require('../middlewares/adminAuth')
const adminController = require('../controllers/adminController')
const sharp = require("sharp");
const fs = require("fs")

const bodyParser = require('body-parser');
adminRoute.use(bodyParser.json())
adminRoute.use(bodyParser.urlencoded({ extended: true }))
const ejs = require('ejs')



adminRoute.use(express.static('public'))

const multer = require('multer')
const path = require('path')

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/avif': 'avif',
  'image/webp': 'webp'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    if (!isValid) {
      const uploadError = new Error('Invalid image type');
      return cb(uploadError);
    }
    cb(null, path.join(__dirname, '../public/admin/'));
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + '_' + file.originalname;
    cb(null, fileName)
  }
})

const sharpImage = (req, res, next) => {
  req.files.forEach((file) => {
    const inputBuffer = fs.readFileSync(file.path);
    sharp(inputBuffer)
      .resize({ width: 300, height: 300, fit: "contain" })
      .toFile(file.path, (err) => {
        if (err) throw err;
      });
  });
  next();
};

const store = multer({ storage: storage, limits: { fileSize: 1024 * 1024 } });

adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin');

adminRoute.get('/admin', adminController.loadLogin)
adminRoute.post('/admin/home', adminController.verifyLogin)
adminRoute.get('/admin/home', adminController.loadadminHome)

adminRoute.post("/admin/users/block-unblock", adminController.changeStatus)
adminRoute.post("/admin/products/disable-enable", adminController.disableOrEnableProduct)
adminRoute.post("/admin/categories/disable-enable", adminController.disableOrEnableCategory)
adminRoute.post("/admin/carousels/disable-enable", adminController.disableOrEnableCarousel)
adminRoute.post('/admin/coupons/disable-enable', adminController.disableOrEnableCoupon)

adminRoute.get('/admin/users', adminController.loadUsers)
adminRoute.get('/admin/categories', adminController.loadCategories)
adminRoute.get('/admin/product', adminController.loadProducts)
adminRoute.get('/admin/carousels', adminController.loadCarousel)
adminRoute.get('/admin/orders', adminController.loadOrders)
adminRoute.get('/admin/orderDetails', adminController.loadOrderDetails)
adminRoute.get('/admin/coupons', adminController.loadCoupons)
adminRoute.get('/admin/offers', adminController.offerlistload)
adminRoute.get('/admin/productOfferCreate', adminController.productOfferCreate)
adminRoute.post("/admin/productOfferCreate", adminController.addProductOffer);
adminRoute.get("/admin/productOfferDelete/:id", adminController.deleteProductOffer);

adminRoute.get("/admin/categoryOfferCreate", adminController.categoryOfferCreate);
adminRoute.post("/admin/categoryOfferCreate", adminController.addCategoryOffer);
adminRoute.get("/admin/categoryOfferDelete/:id", adminController.deleteCategoryOffer);

adminRoute.post('/admin/updateStatus', adminController.updateStatus)

adminRoute.get('/admin/addCategory', adminController.loadCategoryRegister)
adminRoute.get('/admin/addCarousels', adminController.loadCarouselRegister)
adminRoute.get('/admin/addCoupon', adminController.loadCouponRegister)

adminRoute.post('/admin/addCategory', store.array('categoryImage', 1), adminController.saveCategorytoDB)
adminRoute.post('/admin/addCarousels', store.array('carouselImages', 4), adminController.saveCarouseltoDB)
adminRoute.post('/admin/addCoupon', adminController.saveCoupontoDB)

adminRoute.get('/admin/addProduct', adminController.loadProductRegister)
adminRoute.post('/admin/addProduct', store.array('imageUrls', 8), adminController.saveProducttoDB)


adminRoute.get('/admin/edit-category', adminController.editLoadCategory);
adminRoute.post('/admin/edit-category', store.array('categoryImage', 1), adminController.updateCategory);

adminRoute.get('/admin/edit-product', adminController.editLoadProduct);
adminRoute.get('/admin/edit-carousel', adminController.editLoadCarousel);
adminRoute.post('/admin/edit-product', store.array('imageUrls', 8), adminController.updateProduct);
adminRoute.post('/admin/edit-carousel', store.array('carouselImages', 4), adminController.updateCarousel);

adminRoute.get('/admin/edit-coupon', adminController.editLoadCoupon);
adminRoute.post('/admin/edit-coupon', adminController.updateCoupon);

adminRoute.get('/admin/delete-category', adminController.deleteCategory);
adminRoute.get('/admin/delete-product', adminController.deleteProduct);
adminRoute.get('/admin/delete-carousel', adminController.deleteCarousel);
adminRoute.get('/admin/delete-coupon', adminController.deleteCoupon)

adminRoute.get('/admin/logout', adminController.loadLogout)

adminRoute.post('/removeIndeximage', adminController.removeIndexImage)
adminRoute.post('/generate-sales-report', adminController.generateSalesReport);




// adminRoute.get('*',function(req,res){
//     res.redirect('/admin');
// })

module.exports = adminRoute;



