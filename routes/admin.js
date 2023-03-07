var express = require('express');
var router = express.Router();
const { response } = require('../app');
const adminHelpers = require('../models/adminhelpers');
const productHelpers = require('../models/producthelpers');

// var fileUpload=require('express-fileupload');
const cloudinary = require('../utils/cloudinary')
const multer = require('multer')
const path = require('path');
const { resolve } = require('path');
const { Db } = require('mongodb');

//requiring controllers
const adminControllers = require('../controllers/admincontrollers')
const categoryControllers=require('../controllers/categorycontrollers')
const productControllers=require('../controllers/productcontrollers')

//multter
upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname)
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".webp") {
      cb(new Error("File type is not supported"), false)
      console.log('Its working');
      return
    }
    cb(null, true)
  }
})



// const { route } = require('.');
/* GET home page. */


router.get('/', isuserNotLoggedin,adminControllers.renderAdminHome)

router.get('/admindashboard', isadminLoggedIn,adminControllers.renderAdminDashboard )

router.post('/admin',adminControllers.adminLogin)

router.get('/adminuserslist', isadminLoggedIn,adminControllers.adminUsersList )

router.get('/deleteuser/:id',adminControllers. adminDeleteUser)

router.get('/blockuser/:id',adminControllers.adminBlockUser)

router.get('/edituser/:id',adminControllers.adminEditUser )

router.post('/edituser/:id',adminControllers.adminEditUserResponse)

router.get('/insertuser',adminControllers.getAdminUserInsert )

router.post('/insertuser',adminControllers.postAdminUserInsert)

router.get('/back',adminControllers.adminBackUsersList)

router.get('/admincategory', isadminLoggedIn,categoryControllers.adminCategory)

router.get('/adminproduct', isadminLoggedIn,productControllers.renderAdminProduct)

router.get('/addproducts',productControllers.getAdminAddProducts)

router.get('/backadminproduct',productControllers.adminBackToProductPage)

router.post('/addproducts', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },

]),productControllers.postAdminAddProducts)

router.get('/deleteproducts/:id',productControllers.adminDeleteProducts)

router.get('/editproducts/:id',productControllers.renderAdminEditProduct)

router.post('/editproducts/:id', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  //multer code
]),isadminLoggedIn,productControllers.adminEditProduct )

router.get('/addcategory',isadminLoggedIn,categoryControllers.renderAdminAddCategory)

router.post('/addcategory',categoryControllers.adminAddCategory)

router.get('/categoryback',categoryControllers.adminBacktoCategory)

router.get('/editcategory/:id',isadminLoggedIn,categoryControllers.renderAdminEditCategory)

router.post('/editcategory/:id',categoryControllers.adminEditCategory)

router.get('/deletecategory/:id',categoryControllers.adminDeleteCategory )

router.get('/adminlogout',adminControllers.adminLogout)

router.get('/adminorders',isadminLoggedIn,adminControllers.renderAdminOrders)

router.put('/cancel-userorder/:id',adminControllers.cancelUserOrder )

router.put('/shipping-userorder/:id',adminControllers.shipUserOrder)

router.put('/deliverd-userorder/:id',adminControllers.deliverUserOrder)

router.get('/adminreport',isadminLoggedIn,adminControllers.adminSalesReport)

router.get('/adminoffer',isadminLoggedIn,adminControllers.renderAdminOffer)

router.get('/admincoupon',isadminLoggedIn,adminControllers.renderAdminCoupon)

router.post('/add-product-offer',productControllers.adminAddProductOffer)

router.post('/add-category-offer',categoryControllers.adminAddCategoryOffer)

router.get('/deletecategoryoffer/:id',categoryControllers.adminDeleteCategoryOffer)

router.get('/deleteproductoffer/:id',productControllers.adminDeleteProductOffer)

router.post('/addcoupon',adminControllers.adminAddcoupon)

router.get('/deletecoupon/:id',adminControllers.adminDeleteCoupon)

router.put('/cancel-return/:id',adminControllers.adminCancelReturn)

router.put('/accept-return/:id',adminControllers.adminAcceptReturn)

router.get('/userOderDetails/:id',isadminLoggedIn,adminControllers.userOrderDetails)








     //------------------------------------- middlewares-----------------------------------------

    
     // preventing the direct acessing the home page
function isadminLoggedIn(req, res, next) {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/admin')
  }
}


function isuserNotLoggedin(req, res, next) {
  if (req.session.adminLoggedIn) {
    res.redirect('/admin/adminuserslist')
  } else {
    next()
  }
}





module.exports = router;



