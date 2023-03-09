var db = require('../config/connection')
var collection = require('../config/collections')
const { response } = require('../app')
const { userDetails } = require('./adminhelpers')
var objectId=require('mongodb').ObjectId
module.exports={

// addProduct:(product)=>{
//     console.log(product) ;
//     db.collection('product').insertOne(product).then((data)=>{

//     })
// }


addProduct: (product,urls) => {
   
    // product.price=parseInt(product.price)

    return new Promise(async (resolve, reject) => {
      product.image=urls
      product.currentoffer=product.categoryoffer
      product.stock=parseInt(product.stock)

      console.log(product)
    
            product.name=product.name.toUpperCase();  
            db.get().collection(collection.PRODUCT_COLLECTIONS).insertOne(product).then((data) => {
               console.log('product added')
                console.log(data)   

                let response={
                 
                    id:data.insertedId,
                    status:true,
                    
                }
               resolve(response)
                   
                
            })
       
       })
},






productView: (productData) => {
        
    return new Promise(async (resolve, reject) => {
    let product = await db.get().collection(collection.PRODUCT_COLLECTIONS).find().toArray();
     resolve(product)       
            
        
        

    })
},



productDelete:(productId)=>{
    
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTIONS).deleteOne({_id:objectId(productId)}).then((response)=>{
           console.log(response);
            resolve(response)
        })
    })
   },




productDetails:(productId)=>{
    return new Promise ((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:objectId(productId)}).then((product)=>{
            resolve(product);
            console.log(product)
        }).catch((error)=>{
            reject(error)
        })
    })
 },


 updateProducts:(productId,productDetails,urls)=>{
    //  console.log(userDetails)
        return new Promise((resolve,reject)=>{
            console.log(productDetails);
            db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectId(productId)},{$set:
                {name:productDetails.name.toUpperCase(),
                category:productDetails.category,
                description:productDetails.description,
                price:productDetails.price,
                stock:parseInt(productDetails.stock),
                image:urls,
             categoryId:productDetails.categoryId.toString()
            }
        }).then((response)=>{
            console.log("updated");
            resolve()
        }).catch((error)=>{
            reject(error)
        })
        })
    
     },
    
insertCategory:(categoryDetails)=>{
    console.log(categoryDetails)
    return new Promise(async(resolve,reject)=>{
   try{

    categoryDetails.name=categoryDetails.name.toUpperCase();
    // categoryDetails.name=capitalizeFirstLetter(categoryDetails.name);

//     function capitalizeFirstLetter(string) {
//      return string.charAt(0).toUpperCase() + string.slice(1);
//    }

    let category=await db.get().collection(collection.CATEGORY_COLLECTIONS).findOne({name:categoryDetails.name})
   console.log(category);
    if(category==null){
      console.log(categoryDetails)
      


      // categoryDetails.status=true;
        db.get().collection(collection.CATEGORY_COLLECTIONS).insertOne(categoryDetails).then((data)=>{
            console.log("success")
            resolve({status:true})
        })

    }else{
        console.log("falid")
        resolve({status:false})
    }
   }catch{
    resolve({status:false})
   }
        
})
},

categoryView:(categoryData)=>{
    return new Promise((resolve,reject)=>{
        let category=db.get().collection(collection.CATEGORY_COLLECTIONS).find().toArray();
        resolve(category)
    })
},



categoryDetails:(categoryId)=>{
    console.log(categoryId)
    return new Promise ((resolve,reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTIONS).findOne({_id:objectId(categoryId)}).then((response)=>{
          console.log(response);
            resolve(response)
        }).catch((error)=>{
            reject(error)
        })
    })
},


updatecategory:(categoryId,categoryDetails)=>{
    //  console.log(userDetails)
        return new Promise((resolve,reject)=>{
            console.log(categoryDetails);
            categoryDetails.name=categoryDetails.name.toUpperCase();
            db.get().collection(collection.CATEGORY_COLLECTIONS).updateOne({_id:objectId(categoryId)},{$set:
                {name:categoryDetails.name,
                details:categoryDetails.details
                
            }
        }).then((response)=>{
            console.log("updated");
            resolve()
        })
        })
    
     },


     deleteCategory:(categoryId)=>{
        console.log(categoryId)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTIONS).deleteOne({_id:objectId(categoryId)}).then((response)=>{
                resolve(response)
            })
        })
     },

     itemDetails:(productId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:objectId(productId)}).then((response)=>{
              console.log(response);
                resolve(response)

     
            }).catch((error)=>{
               reject(error)
            })
        })
    },

    findCategory:(categoryId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTIONS).findOne({_id:objectId(categoryId)}).then((categoryData)=>{
                resolve(categoryData)
            })
        })
    },

    findCategoryName:(categoryName)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTIONS).findOne({name:categoryName}).then((response)=>{
                resolve(response)
            })

            })
        
    },
    addProductOffer:(productDetails)=>{
     let productoffer=parseInt(productDetails.productOffer)
     
     console.log(productDetails,"productofferrr");
    return new Promise(async(resolve,reject)=>{
  await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectId(productDetails.product)},[{"$set":{productoffer:productoffer}}])
  
  db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectId(productDetails.product)},[{'$set':{currentoffer:{"$max":['$productoffer','$categoryoffer']}}}]).then((response)=>{
    resolve(response)
   })


})
},

addCategoryOffer:(productDetails)=>{
    let categoryoffer=parseInt(productDetails.categoryOffer)
    // console.log(categoryoffer,"categoryofferrr");
    
   
    return new Promise(async(resolve,reject)=>{
        // console.log(productDetails.category,"categoryofferrrId");
     await  db.get().collection(collection.PRODUCT_COLLECTIONS).updateMany({categoryId:productDetails.category},[{"$set":{categoryoffer:categoryoffer}}])
     db.get().collection(collection.PRODUCT_COLLECTIONS).updateMany({categoryId:productDetails.category},[{'$set':{currentoffer:{"$max":['$productoffer','$categoryoffer']}}}]).then((response)=>{
        resolve(response)
       })
 
    })
   
},
categoryOfferAdd:(categoryDetails)=>{
    let categoryoffer=parseInt(categoryDetails.categoryOffer)
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTIONS).updateOne({_id:objectId(categoryDetails.category)},[{'$set':{categoryoffer:categoryoffer}}]).then((response)=>{
            resolve(response)
        })
    })
},
productOfferPrice:(productDetails)=>{
    console.log(productDetails,"prrroooo");
    return new Promise(async(resolve,reject)=>{
    let product=await  db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:objectId(productDetails.product)})
    console.log(product,"product issssss");
   let price=parseInt(product.price)
    let discountamount=(price*product.currentoffer)/100
   let discountAmount= Math.trunc(discountamount)
    console.log(discountAmount,'discount amount');
     let offerPrice=product.price-discountAmount;
     console.log(offerPrice,"offerprice");
db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectId(productDetails.product)},[{'$set':{offerprice:offerPrice}}]).then((response)=>{
    resolve(response);
})


    })

},

cateOfferPrice:(productDetails)=>{
    console.log(productDetails,"productttsss");
    return new Promise(async(resolve,reject)=>{
        let catProducts=await db.get().collection(collection.PRODUCT_COLLECTIONS).find({categoryId:productDetails.category}).toArray()
    console.log(catProducts[0],"categoryproductsss");
    for(let i=0;i<catProducts.length;i++){
        let discountAmount=0
        let offerPrice=0
        discountAmount =Math.trunc((parseInt(catProducts[i].price)*catProducts[i].currentoffer)/100);
          console.log(discountAmount,"discountAmounttttttt");
        
          offerPrice=parseInt(catProducts[i].price-discountAmount)
          console.log(offerPrice,'offerpriceeeeee');

          db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectId(catProducts[i]._id)},[{'$set':{offerprice: offerPrice}}]).then((response)=>{
            console.log(response,'response');
          resolve(response)
        })
        }
    })

},

deleteCategoryOffer:(category)=>{
    console.log(category,'categoryId');
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.CATEGORY_COLLECTIONS).updateOne({_id:objectId(category)},{"$set":{categoryoffer:0}})
        await db.get().collection(collection.PRODUCT_COLLECTIONS).updateMany({categoryId:category},{'$set':{categoryoffer:0}})
        db.get().collection(collection.PRODUCT_COLLECTIONS).updateMany({categoryId:category},[{'$set':{currentoffer:{"$max":['$productoffer','$categoryoffer']}}}]).then((response)=>{
            resolve(response)
           })
   
    })
},

changeCateOfferPrice:(category)=>{

    return new Promise(async(resolve,reject)=>{
        let catProducts=await db.get().collection(collection.PRODUCT_COLLECTIONS).find({categoryId:category}).toArray()
    console.log(catProducts[0],"categoryproductsss");
    for(let i=0;i<catProducts.length;i++){
        let discountAmount=0
        let offerPrice=0
        discountAmount =Math.trunc((parseInt(catProducts[i].price)*catProducts[i].currentoffer)/100);
          console.log(discountAmount,"discountAmounttttttt");
        
          offerPrice=parseInt(catProducts[i].price-discountAmount)
          console.log(offerPrice,'offerpriceeeeee');

          db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectId(catProducts[i]._id)},[{'$set':{offerprice: offerPrice}}]).then((response)=>{
            console.log(response,'response');
          resolve(response)
        })
        }
    })


},

deleteProductOffer:(productId)=>{
    console.log(productId,'productiiiid');
  try{
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectId(productId)},{'$set':{productoffer:0}})
        db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectId(productId)},[{'$set':{currentoffer:{"$max":['$productoffer','$categoryoffer']}}}]).then((response)=>{
          resolve(response)
         })
      
          })
  
}catch{
    reject()
} 
   
},

changeProductOfferPrice:(productId)=>{

    return new Promise(async(resolve,reject)=>{
        let product=await  db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:objectId(productId)})
        console.log(product,"product issssss");
       let price=parseInt(product.price)
        let discountamount=(price*product.currentoffer)/100
       let discountAmount= Math.trunc(discountamount)
        console.log(discountAmount,'discount amount');
         let offerPrice=product.price-discountAmount;
         console.log(offerPrice,"offerprice");
    db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:objectId(productId)},[{'$set':{offerprice:offerPrice}}]).then((response)=>{
        resolve(response);
    })
    
    
        })


},
addCoupon:(couponDetails)=>{
   
   
    return new Promise(async(resolve,reject)=>{
     
        couponDetails.couponName=couponDetails.couponName.toUpperCase()
       
        couponDetails.couponExpDate=new Date(couponDetails.couponExpDate)
        
        couponDetails.couponPercentage=parseInt(couponDetails.couponPercentage)
        couponDetails.maxamount=parseInt(couponDetails.maxamount)
       
        let coupon= await db.get().collection(collection.COUPON_COLLECTION).findOne({couponName:couponDetails.couponName})
      
        console.log(coupon,'couponnnnn');
        // couponDetails.displayExpDate=couponDetails.ExpDate.toDateString()
       
       if(coupon==null){

        console.log('coupon is null');
        db.get().collection(collection.COUPON_COLLECTION).insertOne(couponDetails).then((response)=>{
           
            console.log(response,'resssss')
             resolve({status:true})
          
         })
        }else{
            console.log('coupon already have');
            resolve({status:false})
    }
       
       
    })
},
couponView:()=>{
    return new  Promise(async(resolve,reject)=>{
   let coupon=await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
   resolve(coupon)
    })
},

deleteCoupon:(couponId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectId(couponId)}).then((response)=>{
            resolve(response)
        })
    })

},

productList:(limit,pagenum)=>{
    let skipNum=parseInt((pagenum-1)*limit)
    return new Promise(async(resolve,reject)=>{
    let products=  await db.get().collection(collection.PRODUCT_COLLECTIONS).find({stock:{$gt:0}}).skip(skipNum).limit(limit).toArray()
     resolve(products)
})
},
hasStock:()=>{
    return new Promise(async(resolve,reject)=>{
        let product=await db.get().collection(collection.PRODUCT_COLLECTIONS).find({stock:{$gt:0}}).toArray()
        resolve(product)
    })
}





}