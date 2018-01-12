const request = require("request");
//-- async get rss xml data
//-- callback(error, xml)
exports.get = function (url,callback) {
   request(url, function (error, response, body) {
      if (response && response.statusCode ===200) {
         callback(null, body);
      } else {
         callback(error, null);
      }
   });
}

exports.checkUrl = function(url, callback) {
   request(url, function (error, response, body) {
      if (response && response.statusCode ===200) {
         let ss = body.slice(0,3);
         console.log(ss);
         if (ss==="<rss") {
            callback(null, body);
         } else {
            callback(error, null);
         }
      } else {
         callback(error, null);
      }
   });
}
