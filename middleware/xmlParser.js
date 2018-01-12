var xmldoc = require('xmldoc');

exports.getTitle = function(str) {
   var node = new xmldoc.XmlDocument(str);
   //var node=doc.firstChild;

   var title = node.descendantWithPath("channel.title");

   if(!title) return null;

   return title.val;

}

exports.getItemList = function(str) {
   //-- grab title, url, and date
   var node = new xmldoc.XmlDocument(str);
   var list = node.descendantWithPath("channel").childrenNamed("item");
   var returnList = [];

   for (let i=0; i<list.length; i++) {
      let imgurl="";

      if(list[i].childNamed("media:content")) {
         imgurl=list[i].childNamed("media:content").attr.url;
      }

      returnList.push( {
         title: list[i].childNamed("title").val,
         url: list[i].childNamed("link").val,
         date: list[i].childNamed("pubDate").val,
         imgurl: imgurl
      });
   }
   //--send to obj and add to list and return
   return returnList;
}
