//scripts for all pages

//--parallax scroll code
//helper function
function $$(selector, context) {
    context = context || document;
    var elements = context.querySelectorAll(selector);
    return Array.prototype.slice.call(elements);
}

window.addEventListener("scroll", function() {
   var scrolledHeight= window.pageYOffset;
   $$(".parallax").forEach(function(el,index,array) {
      var limit= el.offsetTop+ el.offsetHeight;
      if(scrolledHeight > el.offsetTop && scrolledHeight <= limit) {
         el.style.backgroundPositionY=  (scrolledHeight - el.offsetTop) /1.5+ "px";

      } else {
         el.style.backgroundPositionY=  "0";
      }
   });
});

var mobilemenu = document.getElementById("menu-mobile");
if (mobilemenu){
   mobilemenu.addEventListener("click", function(evt) {
      var m2 = document.getElementById("menu");
      if (m2.style.display=="inline-block") {
         m2.style.display="none";
      } else {
         m2.style.display="inline-block";
      }
   });
}
