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

var rankButton = document.getElementsByClassName("button-rank");

if (rankButton) {
   for(let i=0; i<rankButton.length; i++) {
      rankButton[i].addEventListener("click", function(event) {
         var newRank = document.getElementsByClassName("input-rank-"+this.value)[0].value;
         ajax().put("/rsslist", {rssId:this.value, newRank: newRank}).then( function(e) {
            //redirect here
            window.location = "/rsslist";
         });
      },
   false);
   }
}
