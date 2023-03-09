var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt=require('bcrypt')
const { response } = require('../app')
var objectId=require('mongodb').ObjectId
module.exports={

    adminLogin: (userData) => {
        console.log(userData,"hihi")
        
        return new Promise(async (resolve, reject) => {
            
                let loginStatus = false
                let response = {}
                try{
                    let user = await db.get().collection(collection.ADMIN_COLLECTIONS).findOne({ email: userData.email })
                    if (user) {
                        console.log(userData, user)
                        await bcrypt.compare(userData.password, user.password).then((status) => {
                            console.log(status)
                                if(status){
        
                                    console.log("login success");
                                    response.user=user
                                    response.status=true
                                    resolve(response)

        
                                }else{
                                    console.log("login failed");
                                    resolve({status:false})
                                }
                        })
                    } else {
                        console.log("login failed");
                        resolve({status:false})
                    }
                }catch{
                    reject()
                }
                
            
            

        })
    },
    

    doView: (userData) => {
        
        return new Promise(async (resolve, reject) => {
        let user = await db.get().collection(collection.USER_COLLECTIONS).find().toArray();
         resolve(user)       
                
            
            

        })
    },



    doDelete:(userId)=>{
    
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTIONS).deleteOne({_id:objectId(userId)}).then((response)=>{
               console.log(response);
                resolve(response)
            })
        })
       },


       userDetails:(userId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTIONS).findOne({_id:objectId(userId)}).then((user)=>{
                resolve(user)
            })
        })
     },
    
     updateUser:(userId,userDetails)=>{
    //  console.log(userDetails)
        return new Promise((resolve,reject)=>{
            console.log(userDetails);
            db.get().collection(collection.USER_COLLECTIONS).updateOne({_id:objectId(userId)},{$set:
                {fname:userDetails.fname,
                email:userDetails.email}
        }).then((response)=>{
            console.log("updated");
            resolve()
        })
        })
    
     },
    
     doInsert: (userData) => {
        console.log(userData)
        
        return new Promise(async (resolve, reject) => {
           try{
            let user = await db.get().collection(collection.USER_COLLECTIONS).findOne({ email: userData.email })
            if (user == null) {
                userData.password = await bcrypt.hash(userData.password, 10)
                db.get().collection(collection.USER_COLLECTIONS).insertOne(userData).then((data) => {
                   
                        resolve({status:true})
                       
                    
                })
            }else{
                resolve({status:false})
            }
                
               
            


           }catch{
            
                
                resolve({status:false})
            
           }
           


        })


    },

    userBlock:(userId)=>{
        return new Promise((resolve,reject)=>{
            console.log(userId);
            db.get().collection(collection.USER_COLLECTIONS).updateOne({_id:objectId(userId)},[{"$set":{status:{"$not":"$status"}}}]).then((response)=>{
                console.log(response);
                 resolve(response)

        })

    })

    

},
totalOrderView:(pageNum,lmt)=>{
    let skipNum=parseInt((pageNum-1)*lmt)
    return new Promise(async(resolve,reject)=>{
        let orders=await db.get().collection(collection.ORDER_COLLECTIONS).find({status:{$ne:'pending'}}).skip(skipNum).limit(lmt).sort({"date":-1}).toArray()
        resolve(orders)
    })
},

userOrderView:()=>{
    return new Promise(async(resolve,reject)=>{
        let orders=await db.get().collection(collection.ORDER_COLLECTIONS).find({ status: { $ne: 'pending' } }).sort({"date":-1}).toArray()
        resolve(orders)
    })
},

cancelOrder:(orderId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:objectId(orderId)},[{'$set':{status:'cancelled'}}]).then((response)=>{
            resolve(response)
        })
      resolve(response)
    })
},

shippingOrder:(orderId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:objectId(orderId)},[{'$set':{status:'shipped'}}]).then((response)=>{
            resolve(response)
        })
      resolve(response)
    })


},



deliverdOrder:(orderId)=>{
    return new Promise((resolve,reject)=>{
       
       let deliverdDate=new Date()
      let displaydeliverdDate= deliverdDate.toDateString()
   
       //   await db.get().collection(collection.ORDER_COLLECTIONS).findOne({_id:objectId(orderId)}).insertOne(deliverdDate)
        db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:objectId(orderId)},[{'$set':{status:'deliverd',deliverdDate:deliverdDate,displaydeliverdDate:displaydeliverdDate}}]).then((response)=>{
            resolve(response)
        })
      resolve(response)
    })
},


totalAmountDeliverd:()=>{
    return new Promise(async(resolve,reject)=>{
let amount= await db.get().collection(collection.ORDER_COLLECTIONS).aggregate(

       
            [
                {
                  '$match': {
                    'status': 'deliverd'
                  }
                }, {
                  '$group': {
                    '_id': 'null', 
                    'totalAmount': {
                      '$sum': '$totalAmount'
                    }
                  }
                }
              ]



        ).toArray()
      console.log(amount,"amounttttttttttttttttttt");
        resolve(amount[0]?.totalAmount)
    })
},

totalDashboardView:()=>{
    return new Promise (async(resolve,reject)=>{
       let data={};
       data.deliverdOrder=await db.get().collection(collection.ORDER_COLLECTIONS).find({status:"deliverd"}).count()
       data.shippedOrder=await db.get().collection(collection.ORDER_COLLECTIONS).find({status:"shipped"}).count()
       data.cancelledOrder=await db.get().collection(collection.ORDER_COLLECTIONS).find({status:"cancelled"}).count()
       data.placedOrder=await db.get().collection(collection.ORDER_COLLECTIONS).find({status:"placed"}).count()
    //    data.pendingOrder=await db.get().collection(collection.ORDER_COLLECTIONS).find({status:"pending"}).count()
       data.returnedOrder=await db.get().collection(collection.ORDER_COLLECTIONS).find({status:"returned"}).count()
       data.reqReturnOrder=await db.get().collection(collection.ORDER_COLLECTIONS).find({status:"order-return-pending"}).count()
       data.totalOrders=parseInt(data.deliverdOrder+data.shippedOrder+data.cancelledOrder+data.placedOrder+data.returnedOrder+data.reqReturnOrder)
       console.log(data.totalOrders,"totalOrderssssss");
       console.log(data,"deliverdorderrrrr");
       resolve(data)
    })
},

totalpaymentView:()=>{
    return new Promise (async(resolve,reject)=>{
        let payment={};
        payment.totalCod=await db.get().collection(collection.ORDER_COLLECTIONS).find({paymentMethod:"COD"}).count()
        payment.totalOnlinepayment=await db.get().collection(collection.ORDER_COLLECTIONS).find({paymentMethod:"paypal"}).count()
        console.log(payment,"hhgghhhhhhhh");
        resolve(payment)
    })
},

totalUsers:()=>{

    return new Promise (async(resolve,reject)=>{
       
        usersTotal=await db.get().collection(collection.USER_COLLECTIONS).find().count()
        console.log(usersTotal,"usersssssss");
        resolve(usersTotal)
    })





},

viewDeliverdOrders:()=>{
    return new Promise(async(resolve,reject)=>{
       let deliverdItems=await db.get().collection(collection.ORDER_COLLECTIONS).find({status:'deliverd'}).sort({'deliverdDate':-1}).toArray()
       console.log(deliverdItems,"itemssss");
        resolve(deliverdItems)
    })
},
cancelReturn:(orderId)=>{

    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:objectId(orderId)},[{'$set':{status:'deliverd'}}]).then((response)=>{
            resolve(response)
        })
      resolve(response)
    })


},
returnAccept:(orderId)=>{

    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:objectId(orderId)},[{'$set':{status:'returned'}}]).then((response)=>{
            resolve(response)
        })
      resolve(response)
    })


},
retrunOrderDetails:(orderId)=>{

    return new Promise(async(resolve,reject)=>{
     let order=await db.get().collection(collection.ORDER_COLLECTIONS).findOne({_id:objectId(orderId)})
     console.log(order,'retrunOrderDetails');
     resolve(order)
   
    })
},
returnUserDetails:(userId)=>{
    console.log(userId,"userId")
return new Promise(async(resolve,reject)=>{
    let user=await db.get().collection(collection.USER_COLLECTIONS).findOne({_id:objectId(userId)})
     console.log(user,'userdetailsss');
     resolve(user)
})

},
wallet:(userId,returnAmount)=>{
    console.log(userId,returnAmount,'userId,returnAmount');
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTIONS).updateOne({_id:objectId(userId)},[{'$set':{wallet:returnAmount}}]).then((response)=>{
            console.log(response,'response');
            resolve(response)
        })
    })
},

productReturn:(orderId)=>{
  console.log(orderId,'orderidddd');
return new Promise(async(resolve,reject)=>{
console.log('bdfsygftseydtsfdysgcuysdgcshcyufsgfyvhgsdufgsyudgtfuygt');
    
let product=await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
   
    {
      '$match': {
        '_id': new objectId(orderId)
      }
    }, {
      '$unwind': {
        'path': '$products'
      }
    }, {
      '$project': {
        'paymentMethod': 0, 
        '_id': 0, 
        'deliveryDetails': 0, 
        'totalAmount': 0, 
        'date': 0, 
        'displayDate': 0, 
        'status': 0,
        'deliverdDate':0,
      'displaydeliverdDate':0,
    }
    }
  ]).toArray()
  console.log(product,'products');
     resolve(product)


})

},

findProduct:(productId)=>{
    return new Promise(async(resolve,reject)=>{
      let product= await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:objectId(productId)})
      console.log(product,'productttttttttttttttstock');
      resolve(product)
    })
    },
changeStock:(productId,quantity)=>{
 return new Promise(async(resolve,reject)=>{
    await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectId(productId)},[{ '$set': { stock:quantity } }]).then((response)=>{
        resolve(response)
    })
    
    })
    },
    getOrderDetails: (orderId) => {

        return new Promise(async (resolve, reject) => {
          
          try{
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


          }catch(err){
            reject(err)
          }
          
          
            


        })


    },




}