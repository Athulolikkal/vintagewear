var express = require('express');
var router = express.Router();
const { response } = require('../app');
const adminHelpers = require('../models/adminhelpers');
const productHelpers = require('../models/producthelpers');
const userHelpers = require('../models/userhelpers');
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
module.exports = {

  renderAdminHome: function (req, res, next) {
    let error = req.session.loginError
    req.session.adminLoggedIn = false
    req.session.loginError = false
    if (req.session.adminLoggedIn) {

      res.redirect("/admin/adminuserslist")
    } else {
      res.render('admin');
    }
  },

  renderAdminDashboard: async (req, res) => {


    let totalUsers = await adminHelpers.totalUsers()
    let totalDetails = await adminHelpers.totalDashboardView()
    console.log(totalDetails, "totaldetailssssss");
    let totalPaymentDetails = await adminHelpers.totalpaymentView()
    console.log(totalPaymentDetails, "paymentdetails");
    adminHelpers.totalAmountDeliverd().then((totalAmount) => {
      console.log(totalAmount, 'totalllllllamounttttt');

      const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      });

      const formattedPrice = formatter.format(totalAmount);
      res.render('admindashboard', { admin: true, totalAmount, totalDetails, totalPaymentDetails, totalUsers, formattedPrice });

    })
  },

  adminLogin: (req, res) => {
    console.log(req.body, "hiii")
    adminHelpers.adminLogin(req.body).then((response) => {
      if (response.status) {
        req.session.adminLoggedIn = true
        req.session.admin = response.user
        res.redirect('/admin/admindashboard');
      }
      else {

        req.session.adminloginError = true
        res.redirect('/admin')
      }
    })
  },

  adminUsersList: (req, res) => {
    adminHelpers.doView().then((response) => {
      console.log(response);
      res.render('adminuserslist', { response, admin: true })
    })

  },
  adminDeleteUser: (req, res) => {
    let userId = req.params.id
    adminHelpers.doDelete(userId).then((response) => {
      res.redirect('/admin/adminuserslist')
    })


  },

  adminBlockUser: (req, res) => {
    let userId = req.params.id
    adminHelpers.userBlock(userId).then((response) => {
      console.log(response);
      res.redirect('/admin/adminuserslist')
    })


  },
  adminEditUser: async (req, res) => {
    let user = await adminHelpers.userDetails(req.params.id)
    console.log(user);
    res.render('edituser', { admin: true, user })
  },
  adminEditUserResponse: (req, res) => {
    adminHelpers.updateUser(req.params.id, req.body).then(() => {
      res.redirect('/admin/adminuserslist')
    })
  },

  getAdminUserInsert: (req, res) => {
    let insertError = req.session.insertError
    req.session.insertError = false
    if (req.session.insertError) {
      res.render('/insertuser', { admin: true })
    } else {
      res.render('insertuser', { insertError, admin: true })
    }

  },
  postAdminUserInsert: (req, res) => {

    adminHelpers.doInsert(req.body).then((response) => {

      if (response.status) {
        res.redirect('/admin/insertuser')

      }
      else {
        req.session.insertError = true
        res.redirect('/admin/insertuser')
      }
    })
  },

  adminBackUsersList: (req, res) => {
    res.redirect('/admin/adminuserslist')
  },
  adminLogout: (req, res) => {
    req.session.adminLoggedIn = false
    res.redirect('/admin')

  },

  renderAdminOrders: async (req, res) => {
    let pageCount = req.query.page || 1
    let pageNum = parseInt(pageCount)
    console.log(pageNum, ':pagenumber');
    let orders = await adminHelpers.userOrderView();
    let totalOrders = orders.length
    console.log(totalOrders, 'totalordersssss');
    let lmt = 10
    let pages = [];
    for (let i = 1; i <= Math.ceil(totalOrders / lmt); i++) {
      pages.push(i)
    }
    console.log(pages, 'pagesssss');

    adminHelpers.totalOrderView(pageNum, lmt).then((response) => {
      res.render('adminorders', { admin: true, response, pages })
    })

  },

  cancelUserOrder: (req, res) => {
    orderId = req.params.id
    adminHelpers.cancelOrder(orderId).then((response) => {
      res.json({ status: true })
    })
  },
  shipUserOrder: (req, res) => {
    orderId = req.params.id
    adminHelpers.shippingOrder(orderId).then((response) => {
      res.json({ status: true })
    })
  },
  deliverUserOrder: (req, res) => {
    orderId = req.params.id
    //  let deliverdDate=adminHelpers.deliverdDate
    adminHelpers.deliverdOrder(orderId).then((response) => {
      res.json({ status: true })
    })
  },

  adminSalesReport: async (req, res) => {

    totalAmount = await adminHelpers.totalAmountDeliverd()
    await adminHelpers.viewDeliverdOrders().then((response) => {

      const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      });

      const formattedPrice = formatter.format(totalAmount);

      res.render('adminreport', { admin: true, response, totalAmount, formattedPrice })

    })
  },
  renderAdminOffer: async (req, res) => {
    let products = await productHelpers.productView()
    console.log(products, 'proooooo');
    productHelpers.categoryView().then((category) => {
      console.log('categoryssss', category);
      res.render('adminoffer', { admin: true, category, products })
    })
  },

  renderAdminCoupon: async (req, res) => {
    let coupon = await productHelpers.couponView()
    console.log(coupon, 'couponlistttt');
    res.render('admincoupon', { admin: true, coupon })
  },

  adminAddcoupon: (req, res) => {
    console.log(req.body, "couponnnn");
    productHelpers.addCoupon(req.body).then((response) => {
      res.json(response)
    })
  },
  adminDeleteCoupon: (req, res) => {
    productHelpers.deleteCoupon(req.params.id).then((response) => {
      res.redirect('/admin/admincoupon')
    })
  },
  adminCancelReturn: (req, res) => {
    orderId = req.params.id
    adminHelpers.cancelReturn(orderId).then((response) => {
      res.json({ status: true })
    })
  },

  adminAcceptReturn: async (req, res) => {
    orderId = req.params.id

    let orderDetails = await adminHelpers.retrunOrderDetails(orderId)
    let item = await adminHelpers.productReturn(orderId)
    console.log(item[0]?.products?.item, 'returnnnnnnn');
    let itemLength = item.length
    console.log(itemLength, 'lengthhhh');
    for (let i = 0; i < itemLength; i++) {
      let stock = 0;
      let quantity = parseInt(item[i]?.products?.quantity)
      console.log(quantity, 'quantityyy');
      let product = await adminHelpers.findProduct(item[i]?.products?.item)
      stock = parseInt(product.stock + quantity)
      console.log(stock, 'stockkkkkk');
      await adminHelpers.changeStock(item[i]?.products?.item, stock)
    }

    let user = orderDetails.userId
    let returnAmount = parseInt(orderDetails.totalAmount)
    console.log(user, returnAmount, 'user,returnamount')

    let userDetails = await adminHelpers.returnUserDetails(user)
    let currentWallet = parseInt(userDetails.wallet)
    console.log(currentWallet, 'userwallet')
    let walletAmount = currentWallet + returnAmount
    console.log(walletAmount, 'actualUserWallet')

    await adminHelpers.wallet(user, walletAmount)

    await adminHelpers.returnAccept(orderId).then((response) => {
      console.log(response, " retruned")
      res.json({ status: true })
    })
  },

  userOrderDetails: async (req, res) => {
    try {
      let products = await adminHelpers.getOrderDetails(req.params.id)
      let status = await userHelpers.getOrderStatus(req.params.id)
      console.log(products, "order-products")
      res.render('order-details', { admin: true, products, status })

    } catch {
      res.render('404error')
    }


  },







}