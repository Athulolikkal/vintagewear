function addToCart(productId) {
    console.log("lkjhgfz");
    $.ajax({

        url: '/addToCart/' + productId,
        method: 'get',
        success: (response) => {
          if(response.status){
            let count=$('#cart-count').html()
            count=parseInt(count)+1
            $('#cart-count').html(count)
          }
          swal("Item successfully add to cart");
        }

    })


}