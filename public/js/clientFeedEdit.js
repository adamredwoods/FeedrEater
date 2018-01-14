//-- event listener and ajax to edit rss listings
var deleteButton = document.getElementsByClassName("button-delete");

if (deleteButton) {
   for(let i=0; i<deleteButton.length; i++) {
      deleteButton[i].addEventListener("click", function(event) {
         ajax().post("/rsslist/delete", {id:this.value}).then( function(e) {
            //redirect here
            window.location = "/rsslist";
         });
      },
   false);
   }
}
