var li_items = document.querySelectorAll(".side_bar_bottom ul li");
var side_bar_menu = document.querySelector(".side_bar_menu");
var wrapper = document.querySelector(".wrapper");

li_items.forEach(function(li_main){
	li_main.addEventListener("click", function(){
		li_items.forEach(function(li){
			li.classList.remove("active");
		})
		li_main.classList.add("active");
	})
})

side_bar_menu.addEventListener("click", function(){
	wrapper.classList.toggle("active");
});