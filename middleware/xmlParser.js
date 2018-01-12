var xmldoc = require('xmldoc');

exports.hasRssTag = function(str) {
   var node = new xmldoc.XmlDocument(str);
   console.log(node);
   return (node.name==="rss");
}

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
   var title = node.descendantWithPath("channel.title").val;
   var list = node.descendantWithPath("channel").childrenNamed("item");
   var returnList = [];

   for (let i=0; i<list.length; i++) {
      let imgurl="";

      if(list[i].childNamed("media:content")) {
         imgurl=list[i].childNamed("media:content").attr.url;
      } else if(node.descendantWithPath("channel.image.url")) {
         imgurl=node.descendantWithPath("channel.image.url").val;
      } else {
         //-- use just one letter if no image, handle this in display code
         imgurl=title.slice(0,1);
      }

      returnList.push( {
         title: list[i].childNamed("title").val,
         url: list[i].childNamed("link").val,
         date: convertDate(list[i].childNamed("pubDate").val),
         imgurl: imgurl
      });
   }
   //--send to obj and add to list and return
   return returnList;
}

function convertDate(date) {
   //--assumes 3 digit day first
   if(date[0]<"0" || date[0]>"9") {
      //--not date, so remove
      date = date.slice(4);
   }
   let d = date.split(" ");

   for(let i=0; i<d.length; i++) {
      if (d[i].length==4) {
         //swap
         let temp = d[0];
         d[0] = d[i];
         d[i] = temp;
         break;
      }
   }
   date = d.join(" ");
   return date;
}
