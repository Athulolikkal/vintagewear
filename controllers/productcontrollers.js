var express = require('express');
var router = express.Router();
const { response } = require('../app');
const adminHelpers = require('../models/adminhelpers');
const productHelpers = require('../models/producthelpers');
const userHelpers=require('../models/userhelpers')

// var fileUpload=require('express-fileupload');
const cloudinary = require('../utils/cloudinary')
const multer = require('multer')
const path = require('path');
const { resolve } = require('path');
const { Db } = require('mongodb');
const adminControllers = require('../controllers/admincontrollers')

upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname)
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".webp") {
      cb(new Error("File type is not supported"), false)
      console.log('Its workinggggggggggggggggggggg');
      return
    }
    cb(null, true)
  }
})
module.exports={

renderAdminProduct:(req, res) => {
    productHelpers.productView().then((response) => {
      console.log(response);
      res.render('adminproduct', { response, admin: true })
    })
  },
  
  getAdminAddProducts:(req, res) => {

    //setting category view on adding products 
    productHelpers.categoryView().then((response) => {
      res.render('addproducts', { response })
    })
  },
 adminBackToProductPage:(req, res) => {

    res.redirect('/admin/adminproduct')
  },

 postAdminAddProducts:async (req, res) => {
    console.log(req.files);
    const cloudinaryImageUploadMethod = (file) => {
      console.log("qwertyui");
      return new Promise((resolve) => {
        cloudinary.uploader.upload(file, (err, res) => {
          console.log(err, " asdfgh");
          if (err)
            console.log(err,"sssssssssssssssssssssssss");
          resolve(res.secure_url)
        })
      })
    }
  
    const files = req.files
    let arr1 = Object.values(files)
    let arr2 = arr1.flat()
    const urls = await Promise.all(
      arr2.map(async (file) => {
        const { path } = file
        const result = await cloudinaryImageUploadMethod(path)
        return result
      })
    )
    console.log(urls);
    // console.log(req.body);
    let product = req.body
     console.log(product,'productssss')
    let cateName = await productHelpers.findCategory(product.category)
    product.categoryId = product.category
    
    product.category = cateName.name
    //adding category name to product
  
   if(cateName.categoryoffer){
    product.categoryoffer=cateName.categoryoffer
  
  let discountAmount=Math.trunc((parseInt(product.price)*cateName.categoryoffer)/100);  
  product.offerprice=product.price-discountAmount
  console.log( product.categoryoffer,'catofferrrr');
  }
   else{
    product.categoryoffer=0
   product.offerprice=parseInt(product.price) 
  console.log( product.categoryoffer,'catofferrrrziroooo');
  }
   
    productHelpers.addProduct(product, urls).then((response) => {
      console.log(response);
      res.redirect('/admin/adminproduct')
  
    })
  },
 
  adminDeleteProducts:(req, res) => {
    let productId = req.params.id
    productHelpers.productDelete(productId).then((response) => {
      res.redirect('/admin/adminproduct')
    })
  },

  renderAdminEditProduct: async(req, res) => {
   
    try{
      let product = await productHelpers.productDetails(req.params.id)
      let category = await productHelpers.categoryView(req.params.id)
      console.log(product);
      res.render('editproducts', { admin: true, product, category })
    
    }catch{
      res.render('404error')
    }
   
   
  },

adminEditProduct:async (req, res) => {
   
      console.log(req.files);
      const cloudinaryImageUploadMethod = (file) => {
        console.log("qwertyui");
        return new Promise((resolve) => {
          cloudinary.uploader.upload(file, (err, res) => {
            console.log(err, " asdfgh");
            if (err) return res.status(500).send("Upload Image Error")
            resolve(res.secure_url)
          })
        })
      }
    
      const files = req.files
      let arr1 = Object.values(files)
      let arr2 = arr1.flat()
      const urls = await Promise.all(
        arr2.map(async (file) => {
          const { path } = file
          const result = await cloudinaryImageUploadMethod(path)
          return result
        })
      )
      console.log(urls);
    
    
    
    
    
      let product = req.body;
      let cateName = await productHelpers.findCategoryName(product.category)
    
      product.categoryId = cateName._id
      product.category = cateName.name
    
    
      productHelpers.updateProducts(req.params.id, product, urls).then(() => {
        res.redirect('/admin/adminproduct')
    
    
    
      })

    
  
  
},  
adminAddProductOffer:async(req,res)=>{
  console.log(req.body,'addproductOfferrrrrr');
 await productHelpers.addProductOffer(req.body)
 productHelpers.productOfferPrice(req.body).then((response)=>{
   res.json(response)
 })
 },
adminDeleteProductOffer:async(req,res)=>{
  console.log(req.params,'productofferrrrr');
await productHelpers.deleteProductOffer(req.params.id)
productHelpers.changeProductOfferPrice(req.params.id).then((response)=>{
  res.redirect('/admin/adminoffer')
 })
},

productDetails:async (req, res) => {

  cartCount = await userHelpers.getCartCount(req.session.user._id)
  productHelpers.itemDetails(req.params.id).then((response) => {

    res.render('productdetail', { response, user, cartCount })
  }).catch((error)=>{
    res.render('404error')
  })
},





}