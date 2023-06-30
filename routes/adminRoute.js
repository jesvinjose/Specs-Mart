const express=require('express');
const adminRoute=express();
const adminAuth=require('../middlewares/adminAuth')
const adminController=require('../controllers/adminController')


const bodyParser=require('body-parser');
adminRoute.use(bodyParser.json())
adminRoute.use(bodyParser.urlencoded({extended:true}))
const ejs=require('ejs')



adminRoute.use(express.static('public'))

const multer = require('multer')
const path   = require('path')

const FILE_TYPE_MAP = {
  'image/png' : 'png',
  'image/jpeg': 'jpeg',
  'image/jpg' : 'jpg',
  'image/avif': 'avif',
  'image/webp':'webp'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const isValid = FILE_TYPE_MAP[file.mimetype];
      let uploadError = new Error('invalid image type');

      if(isValid) {
          uploadError = null
      }
    cb(uploadError, path.join(__dirname,'../public/admin/'))
  },
  filename: function (req, file, cb) {
    const fileName =  Date.now()+'_'+file.originalname ;
    cb(null, fileName)
  }
})

const  store = multer({ storage: storage });

adminRoute.set('view engine','ejs');
adminRoute.set('views','./views/admin');

adminRoute.get('/admin',adminController.loadLogin)
adminRoute.post('/admin/home',adminController.verifyLogin)
adminRoute.get('/admin/home',adminController.loadadminHome)

adminRoute.post("/admin/users/block-unblock",adminController.changeStatus)
adminRoute.post("/admin/products/disable-enable",adminController.disableOrEnableProduct)
adminRoute.post("/admin/categories/disable-enable",adminController.disableOrEnableCategory)
adminRoute.post("/admin/carousels/disable-enable",adminController.disableOrEnableCarousel)

adminRoute.get('/admin/users',adminController.loadUsers)
adminRoute.get('/admin/categories',adminController.loadCategories)
adminRoute.get('/admin/product',adminController.loadProducts)
adminRoute.get('/admin/carousels',adminController.loadCarousel)
adminRoute.get('/admin/orders',adminController.loadOrders)
adminRoute.get('/admin/orderDetails',adminController.loadOrderDetails)

adminRoute.post('/admin/updateStatus',adminController.updateStatus)

adminRoute.get('/admin/addCategory',adminController.loadCategoryRegister)
adminRoute.get('/admin/addCarousels',adminController.loadCarouselRegister)

adminRoute.post('/admin/addCategory',store.array('categoryImage',1),adminController.saveCategorytoDB)
adminRoute.post('/admin/addCarousels',store.array('carouselImages',4),adminController.saveCarouseltoDB)

adminRoute.get('/admin/addProduct',adminController.loadProductRegister)
adminRoute.post('/admin/addProduct',store.array('imageUrls',8),adminController.saveProducttoDB)


adminRoute.get('/admin/edit-category',adminController.editLoadCategory);
adminRoute.post('/admin/edit-category',store.array('categoryImage',1), adminController.updateCategory);

adminRoute.get('/admin/edit-product',adminController.editLoadProduct);
adminRoute.get('/admin/edit-carousel',adminController.editLoadCarousel);
adminRoute.post('/admin/edit-product',store.array('imageUrls',8), adminController.updateProduct);
adminRoute.post('/admin/edit-carousel',store.array('carouselImages',4), adminController.updateCarousel);

adminRoute.get('/admin/delete-category',adminController.deleteCategory);
adminRoute.get('/admin/delete-product',adminController.deleteProduct);
adminRoute.get('/admin/delete-carousel',adminController.deleteCarousel);

adminRoute.get('/admin/logout',adminController.loadLogout) 

adminRoute.post('/removeIndeximage',adminController.removeIndexImage)

// adminRoute.get('*',function(req,res){
//     res.redirect('/admin');
// })

module.exports = adminRoute;



