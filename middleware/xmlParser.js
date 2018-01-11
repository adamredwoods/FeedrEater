var xmldoc = require('xmldoc');

exports.xmlParser = function() {

   function getTitle(str) {
      var doc = new xmldoc.XmlDocument(str);
      var title = doc.childNamed("channel").childNamed("title");
      return title;
   }




}
