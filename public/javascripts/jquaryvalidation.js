$(document).ready(function(){

   

        $("#usersignup-form").validate({
            rules:{
                fname:{
                    required:true,
                    minlength:3
                    
                },
                email:{
                    required:true,
                    email:true
    
                },
                password:{
                    required:true,
                    minlength:4,
                    maxlength:10
    
                },
                address:{
                    required:true,
                    

                },
                agree:{
                    required:true
                }

            }

      
    

    })

   












})