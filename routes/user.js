var express = require('express');
const { response, route, render } = require('../app');
var router = express.Router();
const userHelpers = require('../models/userhelpers');
const productHelpers = require('../models/producthelpers');
const { userDetails } = require('../models/adminhelpers');
// const client = require('twilio')("AC820e52329f55752815191f21cd65fb0b", "70b08a57889f58668984d78288287333")

const userControllers=require('../controllers/usercontrollers')
const categoryControllers=require('../controllers/categorycontrollers')
const productControllers=require('../controllers/productcontrollers')

require('dotenv').config()

const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)

// const passport=require('passport')
// const googleStrategy=require('passport-google-oauth').OAuth2Strategy;

const paypal = require('paypal-rest-sdk');
const { userProfile } = require('../controllers/usercontrollers');

paypal.configure({
  'mode': 'sandbox',
  'client_id':process.env.CLIENT_ID, 
  'client_secret':process.env.CLIENT_SECRET
  // 'client_id': 'AY0h8O7slqMdO1WTA9BEJ58Jc-ZycWU6LSrcHbSa45U89B5P40uk964J_-wozw5j9cBLTyn-Qp1INQia',
  // 'client_secret': 'EPCWSl1TDZfwZdDVKmHrWOvY6gWbFkd4yR97b14o_UieA8ynE37qDdUQ0v4-ZS6QxMqP3Hf1aKzDULZX'
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
// );

// router.get('/google',passport.authenticate('google',{scope:['profile','email']}));
// router.get('/google/callback',passport.authenticate('google',{failureRedirect:'/auth/error'}),
// (req,res)=>{
//   res.redirect('/auth/success');
// }
// );
// router.get('/success',async(req,res)=>{
//   const{failure,success}=await googleAuth.registerWithGoogle(userProfile);
//   res.render('success',{user:userProfile});
// });
// router.get('/error',(req,res)=>res.send('error logging in'));  










/* GET home page. */
router.get('/', userNotLoggedin,userControllers.renderLandingPage);

router.get('/userlogin', userNotLoggedin,userControllers.renderUserLogin)

router.get('/usersignup',userControllers.renderUserSignUp)

router.post('/usersignup', userNotLoggedin,userControllers.userSignUp)

router.get('/userhome', isUserLoggedIn,userControllers.userHome)

router.get('/mencategory',isUserLoggedIn,categoryControllers.menCategory)

router.get('/womencategory',isUserLoggedIn,categoryControllers.womenCategory)

 router.get('/kidscategory',isUserLoggedIn,categoryControllers.kidsCategory)

router.post('/userlogin', userNotLoggedin,userControllers.userLogin)

router.get('/logout', isUserLoggedIn,userControllers.userLogOut)

router.get('/productdetail/:id', isUserLoggedIn,productControllers.productDetails )

router.get('/otplogin',userControllers.renderOtp)

router.post('/otplogin',userControllers.OtpLogin)

router.get('/otpverification', userNotLoggedin,userControllers.renderOtpVerfication)

router.post('/otpverification', userNotLoggedin,userControllers.otpVerification )

router.get('/cart',isUserLoggedIn,userControllers.rederCart)

router.get('/addToCart/:id',userControllers.addToCart)

router.post('/change-product-quantity',userControllers.changeProductQuantity)

router.get('/remove-cart-item/:id',userControllers.removeItemFromCart)

router.get('/checkcart', isUserLoggedIn,userControllers.renderCheckCart)

router.post('/checkcart', isUserLoggedIn,userControllers.checkCart)

router.get('/success',userControllers.paypalSuccess)


router.get('/userorders', isUserLoggedIn,userControllers.userOrders)

router.get('/cancelorder/:id',userControllers.cancelUserOrder)

router.get("/order-details/:id", isUserLoggedIn,userControllers.userOrderDetails)

router.get('/order-cancel/:id',userControllers.userOderCancelStatus)

router.get('/userprofile/:id', isUserLoggedIn,userControllers.userProfile)

router.post('/user-edit-profile',userControllers.userEditProfile)

router.get('/changepassword/:id', isUserLoggedIn,userControllers.renderChangePassword)

router.post('/password-verify',isUserLoggedIn,userControllers.verifyCurrentPassword)

router.post('/change-user-password',userControllers.addNewPassword)

router.post('/applyCoupon-offer',userControllers.applyCoupon)

router.get('/cancelcoupon',userControllers.cancelApplyCoupon)

router.get('/order-return/:id',userControllers.returnOrder)

router.get('/userwallet/:id', isUserLoggedIn,userControllers.wallet)

router.post('/orderaddressadd',userControllers.addOrderAddress)

router.get('/userOrderAddress/:id',isUserLoggedIn, userControllers.userOderAddress)

router.delete('/deleteuseraddress/:id',userControllers.deleteUserAddress)

router.get('/products/',isUserLoggedIn,userControllers.searchProducts)

router.get('/paymentsuccess',userControllers.paymentSuccess)





//<------------------------------- middlewares--------------------------------------->



//perventing from direct acessing the home  page
function isUserLoggedIn(req, res, next) {
  if (req.session.userLoggedIn) {
    user = req.session.user
    next()

  } else {
    res.redirect('/userlogin')
  }
}

//preventing from going to login if we logined ones it helps to stay in login terminal 
function userNotLoggedin(req, res, next) {
  console.log(req.session.userLoggedIn)
  if (req.session.userLoggedIn) {
    console.log(req.session.userLoggedIn);
    res.redirect('/userhome')
  } else {
    next()
  }
}







module.exports = router;
