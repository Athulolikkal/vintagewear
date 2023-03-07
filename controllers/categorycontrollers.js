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


 adminCategory:(req, res) => {
        productHelpers.categoryView().then((response) => {
          res.render('admincategory', { response, admin: true })
      
        })
      
      },
      
  renderAdminAddCategory:(req, res) => {
     res.render('addcategory', { admin: true })
      },

  
    adminAddCategory: (req, res) => {

    productHelpers.insertCategory(req.body).then((response) => {
  
      if (response.status) {
        res.redirect('/admin/admincategory')
  
      }
      else {
  
        res.redirect('/admin/addcategory')
      }
    })
  },
 
  adminBacktoCategory:(req, res) => {
    res.redirect('/admin/admincategory')
  },

 renderAdminEditCategory:async (req, res) => {
   try{
    let category = await productHelpers.categoryDetails(req.params.id)
    console.log(category);
    res.render('editcategory', { admin: true, category })
   }catch{
    res.render('404error')
   }
  
  
  },
 
  adminEditCategory: (req, res) => {
    productHelpers.updatecategory(req.params.id, req.body).then(() => {
      res.redirect('/admin/admincategory')
    })
  },
  adminDeleteCategory:(req, res) => {
    productHelpers.deleteCategory(req.params.id).then((response) => {
      res.redirect('/admin/admincategory')
    })
  },
  adminAddCategoryOffer:async(req,res)=>{
    console.log(req.body,'cateOfferrrrrr');
   await productHelpers.categoryOfferAdd(req.body)
    await  productHelpers.addCategoryOffer(req.body)
   productHelpers.cateOfferPrice(req.body).then((response)=>{
    res.json(response)
   })
    
   },
   adminDeleteCategoryOffer:async(req,res)=>{
    console.log(req.params,"deletecategoryofferrr");
  await productHelpers.deleteCategoryOffer(req.params.id)
  productHelpers.changeCateOfferPrice(req.params.id).then((response)=>{
    res.redirect('/admin/adminoffer')
   })
  },
  menCategory:async(req,res)=>{
    console.log('mmmmmmmmmmm');
     let men=await userHelpers.menView()
   console.log(men,'mennnnn');
   res.render('menproduct',{men,user})
   },
  womenCategory:async(req,res)=>{
    console.log('mmmmmmmmmmm');
     let women=await userHelpers.womenView()
   console.log(women,'womeeenn');
   res.render('womenproduct',{women,user})
   },
 kidsCategory:async(req,res)=>{
    console.log('mmmmmmmmmmm');
     let kids=await userHelpers.kidsView()
   console.log(kids,'kidsss');
   res.render('kidsproducts',{kids,user})
   },
}