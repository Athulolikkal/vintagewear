var express = require('express');
const { response, route, render } = require('../app');
var router = express.Router();
const userHelpers = require('../models/userhelpers');
const productHelpers = require('../models/producthelpers');
const { userDetails } = require('../models/adminhelpers');

require('dotenv').config()

const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)


// const passport=require('passport')
// const googleStrategy=require('passport-google-oauth').OAuth2Strategy;
const paypal = require('paypal-rest-sdk');
const { ObjectID, ObjectId } = require('bson');
const { query } = require('express');

paypal.configure({
  'mode': 'sandbox',

  'client_id': process.env.CLIENT_ID,
  'client_secret': process.env.CLIENT_SECRET
});

// passport.use(
//   new googleStrategy({
//     clientID:process.env.GOOGLE_CLIENT_ID,
//     clientSecret:process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL:process.env.CALLBACK_URL
//   },
//   function(accessToken,refreshToken,profile,done){
//     userProfile=profile;
//     return done(null,userProfile);
//   }
//   )
// )

module.exports = {

  renderLandingPage: function (req, res, next) {

    req.session.userLoggedIn = false
    res.render('index');
  },

  renderUserLogin: (req, res) => {

    let user = req.session.user
    let error = req.session.loginError
    req.session.loginError = false
    res.render('userlogin', { error })

  },

  renderUserSignUp: (req, res) => {
    let signError = req.session.signError
    req.session.signError = false;
    if (req.session.signError) {
      res.redirect('/userlogin');
    } else {

      res.render('usersignup', { signError })
    }

  },

  userSignUp: (req, res) => {

    userHelpers.doSignup(req.body).then((response) => {
      console.log(response)

      if (response.status) {


        res.redirect('/userlogin')
      }
      else {
        req.session.signError = true

        res.redirect('/usersignup')
      }
    })
  },

  userHome: async (req, res) => {
    let user = req.session.user
    let cartCount = null;
    let limit = 6
    let pageNum = req.query.page || 1
    let page = parseInt(pageNum)
    console.log(page);
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    let categoryList = await userHelpers.getCategoryView()
    let products = await productHelpers.productList(limit, page)
    let stockedItems = await productHelpers.hasStock()

    let productCount = stockedItems.length
    console.log(productCount, 'counttttt');
    let productArray = []
    for (let i = 1; i <= Math.ceil(productCount / limit); i++) {
      productArray.push(i)
    }

    console.log(productArray, 'pageArrayy');
    res.render('userhome', { products, users: true, cartCount, user, productArray });

  },

  userLogin: (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
      console.log(response)
      if (response.status) {
        console.log(response.user);
        req.session.userLoggedIn = true
        req.session.user = response.user

        res.redirect('/userhome')
      } else {

        req.session.loginError = true
        res.redirect('/userlogin')
      }
    })
  },
  userLogOut: (req, res) => {
    req.session.userLoggedIn = false
    res.redirect('/userlogin')
  },

  renderOtp: (req, res) => {

    if (req.session.userLoggedIn) {
      res.redirect('/userhome')
    } else {
      let loginError = req.session.loginError
      req.session.loginError = false
      res.render('otplogin', { loginError })
    }

    // let loginError=req.session.loginError
    // req.session.userLoggedIn=false
    // req.session.loginError=false
    // res.render('otplogin',{loginError})
  },


  OtpLogin: (req, res) => {
    if (req.session.userLoggedIn) {
      res.redirect('/userhome')
    } else {
      userHelpers.otpLogin(req.body).then((response) => {

        console.log(response, 'response after checking otpnumber');

        let phonenumber = response.user.phonenumber
        console.log(phonenumber);
        client
          .verify
          .services('VA3d8190eefc8f4be4d347aa366b80873d')
          .verifications
          .create({
            to: `+91${phonenumber}`,
            channel: 'sms'
          }).then((data) => {
            req.session.user = response.phonenumber;
            res.render('otpverification', { phonenumber })
          }).catch((err) => {
            console.log(err, "errrorororor");
          })
      }).catch((response) => {
        console.log(response, 'catcherrorrr');
        req.session.loginError = true;

        res.redirect('/otplogin')
      })

    }
  },

  renderOtpVerfication: (req, res) => {
    // let phonenumber = req.session.phone
    let otpErr = req.session.otpErr
    req.session.otpErr = false
    res.render('otpverification', { otpErr })
  },

  otpVerification: (req, res) => {
    console.log(req.body, "uuuuuuuuuuuuuuuuuuuu");
    client
      .verify
      .services('VA3d8190eefc8f4be4d347aa366b80873d')
      .verificationChecks
      .create({
        to: `+91${req.body.phonenumber}`,
        code: req.body.otp
      }).then((data) => {
        console.log(data);
        if (data.valid) {
          req.session.user = response.user
          req.session.userLoggedIn = true;
          res.redirect('/userhome')
        } else {
          delete req.session.user

          req.session.otpErr = true;
          console.log('1213456');
          res.redirect('/otplogin')
        }
      }).catch((err) => {
        delete req.session.user

        console.log( err)
        res.redirect('/otplogin')
      })
  },

  rederCart: async (req, res) => {

    console.log(req.session.user._id, 'userrrriddd');
    let products = await userHelpers.cartView(req.session.user._id)

    let totalAmount = await userHelpers.totalPrice(req.session.user._id)
    console.log(products)
    res.render('cart', { users: true, user: req.session.user._id, products, totalAmount, user })
  },
  addToCart: (req, res) => {
    console.log('api call')
    productId = req.params.id
    userId = req.session.user._id
    console.log(productId, userId)
    userHelpers.addToCart(productId, userId).then((response) => {
      console.log(response, "here is the response");
      res.json({ status: true })
    })

  },
  changeProductQuantity: async (req, res, next) => {

    let product = await userHelpers.findProduct(req.body.product)
    let stock = product.stock
    console.log(stock, 'productstockkkkk');
    userHelpers.changeProductQuantity(req.body, stock).then(async (response) => {
      console.log(req.body, 'userridisss');
      console.log(req.session.user._id, 'userrrrr');
      response.totalAmount = await userHelpers.totalPrice(req.session.user._id)
      //when we using ajax we only doing passing data in the json format
      console.log(response, 'stockkkk');
      res.json(response)
    })

  },

  removeItemFromCart: (req, res) => {
    console.log('cartremove call')
    productId = req.params.id
    userId = req.session.user._id
    userHelpers.removeItem(productId, userId).then((response) => {
      console.log(response, 'response of');
      res.json({ response })
    })
  },

  renderCheckCart: async (req, res) => {
    let totalAmount = await userHelpers.totalPrice(req.session.user._id)
    let products = await userHelpers.cartView(req.session.user._id)
    let userDetails = await userHelpers.findUser(req.session.user._id)
    let orderAddress = userDetails.oderaddress
    console.log(orderAddress, "productsss,userDetailsssss");
    product = products.length
    console.log(product, "productssslength");
    if (product == 0) {
      res.redirect('/userhome')
    } else {


      res.render('checkcart', { users: true, totalAmount, user, orderAddress })
    }


  },

  checkCart: async (req, res) => {
    console.log(req.body, 'chechcart');

    // let getProduct = await userHelpers.cartView(req.session.user._id)
    // let productNum=getProduct.length
    // console.log(getProduct,'getproductNummmm');
    // console.log(productNum,'productNummmm');
    let products = await userHelpers.getCartProductList(req.body.userId)
    // var totalAmount = await userHelpers.totalPrice(req.session.user._id)
    var totalAmount = parseInt(req.body.totalprice)
    console.log(products, 'productssssssssssssssssssssssssssssssssssssss');
    console.log(totalAmount, "totalamonutaaaaaaaaa");

    let orderAddress = await userHelpers.findOrderAddress(req.body.orderAddressId, req.body.userId)
    console.log(orderAddress, 'orderaddres');
    console.log(orderAddress[0]?.oderaddress?.name, 'name');

    userHelpers.placeOrder(req.body, orderAddress, products, totalAmount).then(async (response) => {
      if (req.body['payment-method'] == 'COD') {

        //stock managemnet
        let item = await userHelpers.cartItems(req.body.userId)
        console.log(item, 'itemmm');
        console.log(item[0]?.products?.item, 'productss iddd')
        let itemLength = item.length
        console.log(itemLength, 'lengthhhhh');

        for (let i = 0; i < itemLength; i++) {

          let stock = 0;
          let quantity = parseInt(item[i]?.products?.quantity)
          console.log(quantity, 'quantityy');

          let product = await userHelpers.findProduct(item[i]?.products?.item)

          stock = product.stock - quantity
          console.log(stock, 'stockkkk');
          await userHelpers.changeStock(item[i]?.products?.item, stock)
          //ends stock management  
        }

        userHelpers.deleteCart(req.session.user._id)
        res.json({ COD: true })
        
      } else   if (req.body['payment-method'] == 'paypal') {
        //paypal start---
        req.session.orderId = response
        var create_payment_json = {
          "intent": "sale",
          "payer": {
            "payment_method": "paypal"
          },
          "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
          },
          "transactions": [{
            "item_list": {
              "items": [{
                "name": 'item',
                "sku": "item",
                "price": totalAmount,
                "currency": "USD",
                "quantity": 1
              }]
            },
            "amount": {
              "currency": "USD",
              "total": totalAmount
            },
            "description": "This is the payment description."
          }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
          console.log(error, "paypal error");
          if (error) {
            //if error happend it goes to userhome
            res.json({ url: "http://localhost:3000/userhome", paypal: false });

          } else {
            console.log("Create Payment Response");
            console.log(payment);
            for (let i = 0; i < payment.links.length; i++) {
              if (payment.links[i].rel === 'approval_url') {
                console.log(payment.links[i].href);
                res.json({ url: payment.links[i].href, paypal: true });
              }
            }
          }
        });
      }
       else if(req.body['payment-method'] == 'stripe'){
       
       const stripePrivateKey=process.env.STRIPE_KEY
       const stripeSecretKey=process.env.STRIPE_PUBLIC_KEY
       
        const stripe=require('stripe')(process.env.STRIPE_KEY)
       
        let items=[{id:1,quantity:1,priceInCent:totalAmount,name:'Vintage Wear'},]
        try{
        

          const session= await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items:items.map(items=>{
            return {
               
              price_data:{
                currency:'INR',
                product_data:{
                  name:items.name,
                },
                unit_amount:items.priceInCent,
              },
              quantity:items.quantity,
           
            }
            }),
        
          
          success_url:`http://localhost:3000/paymentsuccess`,
          cancel_url:`http://localhost:3000/userorders`,
          
          
          })
          // console.log('successsssss');
         console.log(session.url,'urllllllllll');
         
         //stock managemnet
        let item = await userHelpers.cartItems(req.body.userId)
        console.log(item, 'itemmm');
        console.log(item[0]?.products?.item, 'productss iddd')
        let itemLength = item.length
        console.log(itemLength, 'lengthhhhh');

        for (let i = 0; i < itemLength; i++) {

          let stock = 0;
          let quantity = parseInt(item[i]?.products?.quantity)
          console.log(quantity, 'quantityy');

          let product = await userHelpers.findProduct(item[i]?.products?.item)

          stock = product.stock - quantity
          console.log(stock, 'stockkkk');
          await userHelpers.changeStock(item[i]?.products?.item, stock)
          //ends stock management  
        }

        req.session.orderId = response
       
       
       
        let products = await userHelpers.getCartProductList(req.session.user._id)
        console.log(products, 'products aree');
      
        await userHelpers.changePaymentStatus(req.session.orderId, req.session.user._id, products)
        req.session.orderId = null
        res.json({url:session.url,stripe:true})


        }catch (error){

          console.log(error,'stripe error');
         
          throw error
        
        }
      }else if (req.body['payment-method'] == 'wallet'){
             
        req.session.orderId=response
       
        let user=await userHelpers.findUser(req.body.userId)
       
        let userWallet=parseInt(user.wallet)
        console.log(userWallet,'wallet amount');
        if(totalAmount<=userWallet){
          let isWallet=userWallet-totalAmount
       let response= await userHelpers.walletChange(req.body.userId,isWallet)
      
         //stock managemnet
        let item = await userHelpers.cartItems(req.body.userId)
        console.log(item, 'itemmm');
        console.log(item[0]?.products?.item, 'productss iddd')
        let itemLength = item.length
        console.log(itemLength, 'lengthhhhh');

        for (let i = 0; i < itemLength; i++) {

          let stock = 0;
          let quantity = parseInt(item[i]?.products?.quantity)
          console.log(quantity, 'quantityy');

          let product = await userHelpers.findProduct(item[i]?.products?.item)

          stock = product.stock - quantity
          console.log(stock, 'stockkkk');
          await userHelpers.changeStock(item[i]?.products?.item, stock)
          //ends stock management  
        }
        
        console.log(req.session.orderId,'order address');
     
        await userHelpers.changePaymentStatus(req.session.orderId, req.session.user._id, products)
        req.session.orderId = null
           res.json({ COD: true })
        }
        else{
          res.json({wallet:true})
        }
      }
    })
  },

  paypalSuccess: async (req, res) => {
    console.log(req.session.user._id, "userId isss")

    //stock management
    let item = await userHelpers.cartItems(req.session.user._id)
    console.log(item, 'itemmm');
    console.log(item[0]?.products?.item, 'productss iddd')
    let itemLength = item.length
    console.log(itemLength, 'lengthhhhh');

    for (let i = 0; i < itemLength; i++) {

      let stock = 0;
      let quantity = parseInt(item[i]?.products?.quantity)
      console.log(quantity, 'quantityy');

      let product = await userHelpers.findProduct(item[i]?.products?.item)

      stock = product.stock - quantity
      console.log(stock, 'stockkkk');
      await userHelpers.changeStock(item[i]?.products?.item, stock)
      //ends stock management
    }


    let products = await userHelpers.getCartProductList(req.session.user._id)
    console.log(products, 'products aree');
    userHelpers.changePaymentStatus(req.session.orderId, req.session.user._id, products).then(() => {
      req.session.orderId = null
      res.redirect('/paymentsuccess')
    })
  },



  userOrders: async (req, res) => {
    console.log(req.session.user._id);
    let pageNum = req.query.page || 1
    let orders = await userHelpers.viewOrders(req.session.user._id)
    let totalOrders = parseInt(orders.length)
    let ordersLmt = 10;
    let page = parseInt(Math.ceil(totalOrders / ordersLmt))
    let pages = []
    for (let i = 1; i <= page; i++) {
      pages.push(i)
    }
    let getOrders = await userHelpers.userOrders(req.session.user._id, ordersLmt, pageNum)
    console.log(getOrders.length, 'jhfjdkfhsdhf');
    console.log(page, 'pagessCount');
    console.log(totalOrders, 'totalOrdersss');
    res.render('userorders', { users: true, getOrders, user: req.session.user, pages })
  },

  cancelUserOrder: (req, res) => {
    console.log('cancelorder')
    orderId = req.params.id
    userId = req.session.user._id
    console.log(orderId, userId)
    userHelpers.cancelOrder(orderId, userId).then((response) => {
      console.log(response, "here is the response");
      res.json({ status: true })
    })

  },

  returnOrder: (req, res) => {
    orderId = req.params.id
    userId = req.session.user._id
    userHelpers.returnOrder(orderId, userId).then((response) => {
      console.log(response, "order cancelled")
      res.json({ status: true })
    })
  },




  userOrderDetails: async (req, res) => {

    try {
      let products = await userHelpers.getOrderDetails(req.params.id)
      let status = await userHelpers.getOrderStatus(req.params.id)
      console.log(products, "order-products")
      console.log(status, ':status');
      res.render('order-details', { users: true, user: req.session.user, products, status })

    } catch (err) {

      res.render('404error')
    }
  },

  userOderCancelStatus: (req, res) => {
    orderId = req.params.id
    userId = req.session.user._id
    userHelpers.orderCancelation(orderId, userId).then((response) => {
      console.log(response, "order cancelled")
      res.json({ status: true })
    })
  },

  userProfile: async (req, res) => {
    try {
      userId = req.params.id
      console.log(userId, "userId is this")
      let userDetails = await userHelpers.userDetails(userId)
      res.render('userprofile', { userDetails, user })

    } catch {
      res.render('404error')
    }
  },

  userEditProfile: (req, res) => {
    let userDetails = req.body;
    userHelpers.editUserProfile(userDetails).then((response) => {
      //when we using ajax we only doing passing data in the json format
      console.log(response, "response of update")
      res.json(response)
    })

  },



  renderChangePassword: async (req, res) => {
    try {
      userId = req.params.id
      let userDetails = await userHelpers.userDetails(userId)
      res.render('changepassword', { user, userDetails })
    } catch {
      res.render('404error')
    }

  },



  verifyCurrentPassword: (req, res) => {
    let userDetails = req.body
    console.log(userDetails, "password,id")
    userHelpers.passwordVerify(userDetails).then((response) => {
      console.log(response, "responseeeee");
      res.json(response)

    })

  },

  addNewPassword: (req, res) => {
    console.log(req.body, "passsworddd");
    userHelpers.changePassword(req.body).then((response) => {
      console.log(response, "eeeeeeee");
      res.json(response)
    })

  },
  applyCoupon: async (req, res) => {
    console.log(req.body, "applycoupon");
    let coupon = req.body
    // let couponCode=coupon.toUpperCase()
    console.log(coupon, 'couponnnnnn');
    var totalAmount = await userHelpers.totalPrice(req.session.user._id)
    console.log(totalAmount, 'tottaaaaaal');
    await userHelpers.verifyCoupon(coupon, totalAmount).then((response) => {
      console.log(response, 'couponavailableeee');
      res.json(response)
     
    })
  },
  cancelApplyCoupon: (req, res) => {
    res.redirect('/checkcart')
  },

  orderCancel: (req, res) => {
    orderId = req.params.id
    // userId = req.session.user._id
    userHelpers.returnOrder(orderId).then((response) => {
      console.log(response, "order retruned")
      res.json({ status: true })
    })
  },

  wallet: async (req, res) => {
    try {
      userId = req.params.id
      let userDetails = await userHelpers.userDetails(userId)
      
      const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      });
      
      const formattedPrice = formatter.format(userDetails.wallet);
      res.render('userwallet', { user, userDetails,formattedPrice })


    } catch {
      res.render('404error')
    }


  },

  addOrderAddress: async (req, res) => {

    // console.log(req.body,'dbhjgd');
    let orderAddress = {}
    orderAddress.orderAddressId = ObjectId();
    orderAddress.name = req.body.name
    orderAddress.phonenumber = req.body.phonenumber
    orderAddress.housename = req.body.housename
    orderAddress.street = req.body.street
    orderAddress.town = req.body.town
    orderAddress.district = req.body.district
    orderAddress.pincode = req.body.pincode

    let userId = req.body.userId


    console.log(orderAddress, userId, 'bhsgds');

    let orderAddressView = await userHelpers.orderAddressView(userId)
    console.log(orderAddressView);

    // let address=orderAddressView.oderaddress.length
    // console.log(address,'addressCounttt');
    // if(address<=2){

    await userHelpers.addOrderAddress(orderAddress, userId).then((response) => {
      console.log(response, 'here the response...');
      res.json(response)

    })

  },

  userOderAddress: async (req, res) => {
    try {
      userId = req.params.id
      let userDetails = await userHelpers.userDetails(userId)
      console.log(userDetails, 'userdetailssssss');
      res.render('useraddress', { user, userDetails })
    } catch {
      res.render('404error')
    }


  },

  deleteUserAddress: async (req, res) => {
    orderId = req.params.id
    userId = req.session.user._id
    console.log(orderId, userId, 'orderId,userIdddd');
    await userHelpers.deleteAddress(orderId, userId).then((response) => {

      let userDetails = userHelpers.userDetails(userId)

      res.render('useraddress', { user, userDetails })
    })
  },

  searchProducts: async (req, res) => {
    let search = req.query.search;
    console.log(search, 'searchhhhhh');

    cartCount = await userHelpers.getCartCount(req.session.user._id)
    let categoryList = await userHelpers.getCategoryView()


    await userHelpers.searchResults(search).then((searchItem) => {
      res.render('userhome', { searchItem, users: true, cartCount, user })

    }).catch(() => {

      let err = 'not found'

      res.render('noresult', { err, users: true, cartCount, user })
    })

  },
  paymentSuccess: (req, res) => {
    res.render('paymentsuccess')
  }








}