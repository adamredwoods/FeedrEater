const request = require("request");
//-- async get rss xml data
//-- callback(error, xml)
exports.get = function (url,callback) {
   request(url, function (error, response, body) {
      if (response.statusCode ===200) {
         callback(null, body);
      } else {
         callback(error, null);
      }
   });
}
