var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { response } = require('../app')
const e = require('express')
const { userDetails, wallet } = require('./adminhelpers')
var objectId = require('mongodb').ObjectId
module.exports = {


    doSignup: (userData) => {
        // console.log(userData)
        //if promise or callback is not used it will return a null result
        return new Promise(async (resolve, reject) => {
            // console.log(userData)
            try {
                let user = await db.get().collection(collection.USER_COLLECTIONS).findOne({ email: userData.email })

                if (user == null) {


                    userData.password = await bcrypt.hash(userData.password, 10)
                    userData.status = true;
                    userData.wallet = 0;
                    userData.oderaddress = []
                    db.get().collection(collection.USER_COLLECTIONS).insertOne(userData).then((data) => {

                        resolve({ status: true })


                    })
                }
                else {
                    resolve({ status: false })
                }





            }
            catch {


                resolve({ status: false })

            }



        })


    },

    doLogin: (userData) => {

        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}

            try {
                let user = await db.get().collection(collection.USER_COLLECTIONS).findOne({ email: userData.email })
                if (user) {

                    if (user.status == true) {
                        console.log(userData, user)
                        await bcrypt.compare(userData.password, user.password).then((status) => {
                            console.log(status)
                            console.log(user.status)
                            console.log("user is not blocked");
                            if (status) {
                                console.log("login success");
                                response.user = user
                                response.status = true
                                resolve(response)
                            } else {
                                console.log("login failed");
                                resolve({ status: false })
                            }
                        })
                    } else {
                        console.log("user blocked")
                        resolve({ status: false })
                    }
                }


                else {
                    console.log("login failed");
                    resolve({ status: false })
                }

            } catch {
                reject()
            }



        })
    },

    otpLogin: (userData) => {
        let response = {};
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTIONS).findOne({ phonenumber: userData.phonenumber })
            console.log(user);
            if (user) {
                response.user = user;
                response.status = true;
                console.log('hiiiiiiiii');
                resolve(response);
            } else {
                console.log('Login Failed');
                resolve({ status: false })
            }
        }
        )
    },

    addToCart: (productId, userId) => {

        let productObj = {
            item: objectId(productId),
            quantity: 1
        }




        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTIONS).findOne({ user: objectId(userId) })

            if (userCart) {
                let productExist = userCart.products.findIndex(product => product.item == productId)
                console.log(productExist)
                //if 0 it means there is no product
                if (productExist != -1) {
                    db.get().collection(collection.CART_COLLECTIONS).updateOne({ user: objectId(userId), 'products.item': objectId(productId) },
                        {   //$ sign to change elements in a array in DB
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve()
                    })
                } else {
                    db.get().collection(collection.CART_COLLECTIONS).updateOne({ user: objectId(userId) },
                        {
                            $push: {
                                products: productObj
                            }
                        }).then((response) => {
                            console.log(response);
                            resolve(response)
                        })
                }
            } else {

                let cartObj = {
                    user: objectId(userId),
                    products: [productObj]
                }
                db.get().collection(collection.CART_COLLECTIONS).insertOne(cartObj).then((response) => {
                    console.log(response);
                    resolve(response)
                })
            }

        })
    },


    cartView: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTIONS).aggregate([

                {
                    $match: { user: objectId(userId) }

                },

                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: "$products.quantity"
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTIONS,
                        localField: "item",
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, productDetails: { $arrayElemAt: ['$productDetails', 0] }
                    }

                },



            ]).toArray()

            //   console.log(cartItems[0].productDetails,"hlooo");
            resolve(cartItems)


        })

    },

    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db.get().collection(collection.CART_COLLECTIONS).findOne({ user: objectId(userId) })
            console.log(cart, 'this is cart')
            if (cart) {

                count = cart.products.length
            }
            resolve(count)
        })
    },

    findProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({ _id: objectId(productId) })
            console.log(product, 'productttttttttttttttstock');
            resolve(product)
        })
    },







    changeProductQuantity: (details, stock) => {
        console.log(details, 'hohohoooo')
        console.log(stock, 'stockkkk')
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        stock = stock - 1;

        //    console.log(cartId,count,productId,"hohohohohoho")
        return new Promise(async (resolve, reject) => {



            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTIONS).updateOne({ _id: objectId(details.cart) }, {
                    $pull: { products: { item: objectId(details.product) } }
                }).then((response) => {

                    resolve({ removeProduct: true })
                })
            } else {

                if (stock <= details.quantity && details.count == -1) {


                    db.get().collection(collection.CART_COLLECTIONS).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {   //$ sign to change elements in a array in DB
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })


                }
                else if (details.quantity <= stock && details.count == 1) {

                    db.get().collection(collection.CART_COLLECTIONS).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {   //$ sign to change elements in a array in DB
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })




                } else if (details.quantity <= stock && details.count == -1) {


                    db.get().collection(collection.CART_COLLECTIONS).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {   //$ sign to change elements in a array in DB
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })



                } else {

                    resolve({ stockOut: true })

                }

            }
        })
    },

    removeItem: (productId, userId) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTIONS).updateOne({ user: objectId(userId) }, {
                $pull: { products: { item: objectId(productId) } }
            }
            ).then((response) => {
                resolve(response)
            })
        })
    },




    totalPrice: (userId) => {
        console.log(userId, "userrrrrrr");
        return new Promise(async (resolve, reject) => {



            let total = await db.get().collection(collection.CART_COLLECTIONS).aggregate([

                {

                    $match: { user: objectId(userId) }


                },

                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: "$products.quantity"
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTIONS,
                        localField: "item",
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, productDetails: { $arrayElemAt: ['$productDetails', 0] }
                    }

                },
                {



                    $group: {
                        _id: null,

                        total: { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$productDetails.offerprice' }] } }

                    }


                }
            ]).toArray()
            console.log(total);
            resolve(total[0]?.total)

        })
    },

    placeOrder: (details, order, products, total) => {
        return new Promise((resolve, reject) => {

            console.log(order, products, total, 'orderrrrrrrrrrrr')
            console.log(order[0]?.oderaddress?.phonenumber, 'ordernameeeeeeeeeeeeeeeeeeeeeeeeee');
            let status = details['payment-method'] === 'COD' ? 'placed' : 'pending'
            let date = new Date()
            let orderObj = {
                deliveryDetails: {
                    // name: order.name,
                    // email: order.email,
                    // mobile: order.phonenumber,
                    // address: order.address,
                    // pincode: order.pincode,
                    name: order[0]?.oderaddress?.name,
                    housename: order[0]?.oderaddress?.housename,
                    mobile: order[0]?.oderaddress?.phonenumber,
                    streetAddress: order[0]?.oderaddress?.street,
                    townAddress: order[0]?.oderaddress?.town,
                    districAddress: order[0]?.oderaddress?.district,
                    pincode: order[0]?.oderaddress?.pincode,
                },
                userId: objectId(details.userId),
                paymentMethod: details['payment-method'],
                products: products,
                totalAmount: parseInt(total),
                date: date,
                displayDate: date.toDateString(),
                status: status
            }





            console.log(orderObj, 'placeorderrrrrrrrrrrrrrrr');
            db.get().collection(collection.ORDER_COLLECTIONS).insertOne(orderObj).then((response) => {
                console.log(response, "okiiiiiiiiiiiiiiiiiii");
                resolve(response.insertedId)
            })

        })
    },

    deleteCart: (userId) => {
        db.get().collection(collection.CART_COLLECTIONS).deleteOne({ user: objectId(userId) })


    },

    getCartProductList: (userId) => {
        console.log(userId, "userId isss");
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTIONS).findOne({ user: objectId(userId) })
            console.log(cart, ":cart");
            resolve(cart?.products)
        })
    },

    viewOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let myOrders = await db.get().collection(collection.ORDER_COLLECTIONS).find({ userId: objectId(userId) }).sort({ 'date': -1 }).toArray()
            console.log(myOrders, "myorders")
            resolve(myOrders)
        })
    },

    userOrders: (userId, lmt, pageNum) => {
        let skipNum = parseInt((pageNum - 1) * lmt)
        return new Promise(async (resolve, reject) => {
            let myOrders = await db.get().collection(collection.ORDER_COLLECTIONS).find({ userId: objectId(userId), status: { $ne: 'pending' } }).skip(skipNum).limit(lmt).sort({ 'date': -1 }).toArray()
            resolve(myOrders)
        })
    },

    cancelOrder: (orderId, userId) => {
        console.log('orderid,userid', orderId, userId);
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.ORDER_COLLECTIONS).find({ userId: objectId(userId) })
            if (user) {
                console.log(user, 'i am the user')
                db.get().collection(collection.ORDER_COLLECTIONS).deleteOne({ _id: objectId(orderId) }).then((response) => {
                    resolve(response)
                })

            } else {
                resolve(response)
            }


        })

    },
    getOrderDetails: (orderId) => {


        return new Promise(async (resolve, reject) => {

            try {

                let orderItems = await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([

                    {
                        $match: { _id: objectId(orderId) }

                    },

                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: "$products.quantity"
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTIONS,
                            localField: "item",
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, productDetails: { $arrayElemAt: ['$productDetails', 0] }
                        }

                    },

                ]).toArray()

                console.log(orderItems, "hloooOrderItems");
                resolve(orderItems)


            } catch (error) {
                console.log(error);
                reject(error)
            }




        })

    },

    getOrderStatus: (orderId) => {
        console.log(orderId, 'orderrrrrrid');
        return new Promise(async (resolve, reject) => {

            try {
                let orderStatus = await db.get().collection(collection.ORDER_COLLECTIONS).aggregate(

                    [
                        {
                            '$match': {
                                '_id': new objectId(orderId)
                            }
                        }, {
                            '$project': {
                                'status': 1,
                                '_id': 0
                            }
                        }
                    ]).toArray()
                console.log(orderStatus[0].status, 'statusssssss');
                resolve(orderStatus[0]?.status)
            } catch (error) {
                console.log(error);
                reject(error)
            }

        })
    },




    returnOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTIONS).updateOne({ _id: objectId(orderId) }, [{ '$set': { status: 'order-return-pending' } }]).then((response) => {
                resolve(response)
            })
        })
    },

    // returnOrder:(orderId)=>{
    //     return new Promise((resolve,reject)=>{
    //         db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:objectId(orderId)},[{ '$set': { status: 'order-return-pending' } }]).then((response)=>{
    //             resolve(response)
    //         })
    //     })
    // },


    orderCancelation: (orderId, userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.ORDER_COLLECTIONS).find({ userId: objectId(userId) })
            if (user) {
                db.get().collection(collection.ORDER_COLLECTIONS).updateOne({ _id: objectId(orderId) }, [{ '$set': { status: 'cancelled' } }]).then((response) => {
                    resolve(response)
                })
            } else {
                resolve(response)
            }

        })

    },

    editUserProfile: (userDetails) => {
        return new Promise((resolve, reject) => {
            console.log(userDetails.userId, "userDetails,userId")
            db.get().collection(collection.USER_COLLECTIONS).updateOne({ _id: objectId(userDetails.userId) }, {
                $set:
                {
                    fname: userDetails.fname,
                    email: userDetails.email,
                    phonenumber: userDetails.phonenumber,
                    address: userDetails.address
                }
            }).then((response) => {
                console.log('updated')
                resolve(response)
            })
        })
    },

    viewUsers: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTIONS).findOne({ _id: objectId(userId) }).then((user) => {
                resolve(user)

            })
        })
    },

    userDetails: (userId) => {


        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTIONS).findOne({ _id: objectId(userId) }).then((response) => {
                resolve(response)
            }).catch((err) => {
                reject(err)
            })
        })





    },

    changePaymentStatus: (orderId, userId, products) => {
        console.log(orderId, userId, products, "details areeee")
        return new Promise((resolve, reject) => {
            products.forEach(async (item) => {
                let response = db.get().collection(collection.ORDER_COLLECTIONS).updateOne({ _id: objectId(orderId) }, [{ '$set': { status: 'placed' } }])
                // await db.get().collection(collection.PRODUCT_COLLECTIONS)
                //     .updateOne({
                //         _id: objectId(item.item)
                //     }, {
                //         $inc: {
                //             stock: -(item.quantity)
                //         }
                //     })
                console.log(response, 'responseeeeeeeeeeeeeee');
            })
            db.get().collection(collection.CART_COLLECTIONS)
                .deleteOne({
                    user: objectId(userId)
                })
            resolve()
        })
    },

    passwordVerify: (userDetails) => {
        console.log(userDetails.userId, userDetails.password, "userrrrrrrr");
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTIONS).findOne({ _id: objectId(userDetails.userId) })

            if (user) {

                await bcrypt.compare(userDetails.password, user.password).then((status) => {

                    if (status) {
                        console.log('password correct');
                        // response.user=user
                        // response.status=true
                        resolve({ status: true })
                        console.log(status);

                    } else {
                        resolve({ status: false })

                        console.log('password wrong');
                    }
                })

            } else {
                resolve({ status: false })
                console.log(response, "no user");
            }

        })
    },



    changePassword: (passwordDetails) => {
        console.log(passwordDetails.newpassword, passwordDetails.repassword, "newpasswooord");
        return new Promise(async (resolve, reject) => {

            if (passwordDetails.newpassword === passwordDetails.repassword) {

                passwordDetails.newpassword = await bcrypt.hash(passwordDetails.newpassword, 10)

                db.get().collection(collection.USER_COLLECTIONS).updateOne({ _id: objectId(passwordDetails.userId) }, {
                    $set: {
                        password: passwordDetails.newpassword
                    }
                }).then((status) => {
                    resolve({ status: true })
                })
            } else {
                resolve({ status: false })
            }

        })
    },
    verifyCoupon: (couponname, total) => {

        try {

            return new Promise(async (resolve, reject) => {
                couponname.couponCode = couponname.couponCode.toUpperCase();
                console.log(couponname.couponCode, 'uppercasecode');

                let couponAvailable = await db.get().collection(collection.COUPON_COLLECTION).findOne({
                    couponName: couponname.couponCode,
                    couponExpDate: { $gte: new Date() }
                })

                console.log(couponAvailable, 'couponnnnnn');

                if (couponAvailable !== null) {
                    console.log('coupon is hereeee');

                    let discountamount = (total * couponAvailable.couponPercentage) / 100
                    let discountAmount = Math.trunc(discountamount)
                    console.log(discountAmount, 'couponofferrrr');

                    if (discountAmount >= couponAvailable.maxamount) {

                        var totalAmount = total - couponAvailable.maxamount
                        //-----------
                        let offer = {}
                        offer.totalAmount = totalAmount,
                            offer.discount = couponAvailable.maxamount
                        console.log(offer.totalAmount, 'totallllll');
                        console.log(offer.discount, 'disconut');
                        //----------
                        console.log(offer, 'totalcouponamt');
                        resolve(offer)
                    }
                    else {
                        var totalAmount = total - discountAmount

                        let offer = {}
                        offer.totalAmount = totalAmount,
                            offer.discount = discountAmount
                        console.log(offer, 'totallllllofferrrrrrrrrr');
                        console.log(totalAmount, 'totalamountofproduct');
                        resolve(offer)


                    }

                } else {
                    console.log('no valid coupon');
                    let offer = {}
                    offer.totalAmount = 0,
                        offer.discount = 0
                    console.log(offer, 'totallllllofferrrrrrrrrr');
                    resolve(offer)
                }
            })
        } catch {

            resolve({ status: false })
        }

    },

    returnOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTIONS).updateOne({ _id: objectId(orderId) }, [{ '$set': { status: 'order-return-pending' } }]).then((response) => {
                resolve(response)
            })
        })
    },
    getCategoryView: () => {
        return new Promise((resolve, reject) => {
            let category = db.get().collection(collection.CATEGORY_COLLECTIONS).find().toArray();
            resolve(category)
        })
    },
    menView: () => {
        return new Promise(async (resolve, reject) => {
            let men = await db.get().collection(collection.PRODUCT_COLLECTIONS).find({ category: 'MEN' }).toArray();
            console.log(men, 'meeeenn');
            resolve(men)
        })
    },
    womenView: () => {
        return new Promise(async (resolve, reject) => {
            let women = await db.get().collection(collection.PRODUCT_COLLECTIONS).find({ category: 'WOMEN' }).toArray();
            console.log(women, 'women');
            resolve(women)
        })
    },
    kidsView: () => {
        return new Promise(async (resolve, reject) => {
            let kids = await db.get().collection(collection.PRODUCT_COLLECTIONS).find({ category: 'KIDS' }).toArray();
            console.log(kids, 'kids');
            resolve(kids)
        })
    },

    addOrderAddress: (orderDetails, userId) => {
        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.USER_COLLECTIONS).findOneAndUpdate({ _id: objectId(userId) }, { $push: { oderaddress: orderDetails } }).then((response) => {
                resolve(response)
            })
        })

    },
    orderAddressView: (userId) => {
        return new Promise((resolve, reject) => {
            let address = db.get().collection(collection.USER_COLLECTIONS).findOne({ _id: objectId(userId) })
            resolve(address)
        })
    },

    //     removeOrderAddress:(userId)=>{
    //   return new Promise(async(resolve,reject)=>{
    //     db.get().collection(collection.USER_COLLECTIONS).updateOne({_id:objectId(userId)},{$pull:{oderaddress:{$slice:[0,1]}}})

    // })
    // },  


    findUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTIONS).findOne({ _id: objectId(userId) })
            console.log(user, 'userr');
            resolve(user)

        })
    },

    findOrderAddress: (orderAddressId, userId) => {

        return new Promise(async (resolve, reject) => {
            let orderAddress = await db.get().collection(collection.USER_COLLECTIONS).aggregate([
                {
                    '$match': {
                        '_id': new objectId(userId)
                    }
                }, {
                    '$unwind': {
                        'path': '$oderaddress'
                    }
                }, {
                    '$project': {
                        '_id': 0,
                        'oderaddress.orderAddressId': 1,
                        'oderaddress.name': 1,
                        'oderaddress.housename': 1,
                        'oderaddress.street': 1,
                        'oderaddress.town': 1,
                        'oderaddress.district': 1,
                        'oderaddress.phonenumber': 1,
                        'oderaddress.pincode': 1
                    }
                }, {
                    '$match': {
                        'oderaddress.orderAddressId': new objectId(orderAddressId)
                    }
                }
            ]).toArray()
            console.log(orderAddress, 'ghdsdasfht');
            resolve(orderAddress)
        })
    },

    deleteAddress: (addressId, userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTIONS).updateOne({ _id: objectId(userId) }, {
                $pull: {
                    oderaddress: {
                        orderAddressId: objectId(addressId)
                    }
                }
            }).then((response) => {
                console.log(response, 'responseee');
                resolve(response)
            })

        })

    },

    cartItems: (userId) => {

        console.log(userId, 'useridddd');
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTIONS).aggregate([

                {
                    '$match': {
                        'user': new objectId(userId)
                    }
                }, {
                    '$unwind': {
                        'path': '$products'
                    }
                }, {
                    '$project': {
                        '_id': 0,
                        'user': 1,
                        'products.quantity': 1,
                        'products.item': 1
                    }
                }

            ]).toArray()
            console.log(cart, 'carttttttttts');
            resolve(cart)
        })


    },

    changeStock: (productId, quantity) => {

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({ _id: objectId(productId) }, [{ '$set': { stock: quantity } }]).then((response) => {
                resolve(response)
            })

        })
    },
    searchResults: (searchItem) => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.PRODUCT_COLLECTIONS).find({'$and':[{stock:{$gt:0}
            },{ '$or': [
                { name: { $regex: searchItem, '$options': 'i' } },
                { category: { $regex: searchItem, '$options': 'i' } },
            ]}]

               


            }).toArray()
            console.log(result, 'resultssss');

            if (result.length > 0) {
                console.log('item found.....here is the item');
                resolve(result);

            } else {
                console.log('item not found.....');
                reject()
            }

        })
    },

    walletChange: (userId, walletAmt) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USER_COLLECTIONS).updateOne({ _id: objectId(userId) }, [{ '$set': { wallet: walletAmt } }]).then((response) => {
                console.log(response);
                resolve(response)
            })
        })
    }




}



