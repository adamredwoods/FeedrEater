var xmldoc = require('xmldoc');

exports.getTitle = function(str) {
   var node = new xmldoc.XmlDocument(str);
   //var node=doc.firstChild;

   var title = node.descendantWithPath("channel.title");

   if(!title) return null;

   return title.val;

}
