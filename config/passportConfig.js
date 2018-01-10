var passport = require("passport");
// var localStrategy = require("passport-local").Strategy;
var TwitterStrategy = require("passport-twitter").Strategy;
var db = require("../models");
require("dotenv").config;

// passport.serializeUser(function(user, callback) {
//    callback(null, user.id);
// });
//
// passport.deserializeUser(function(id, callback) {
//    db.user.findById(id).then(function(user) {
//       callback(null,user);
//    }).catch(function(err){
//       callback(err, null);
//    });
// });

// passport.use(new localStrategy({
//       usernameField: "email",
//       passwordField: "password"
//    }, function(email, password, callback) {
//       db.user.findOne({
//          where: { email:email }
//       }).then( function(user) {
//          if(!user|| !user.isValidPassword(password)) {
//             callback(null,false);
//          } else {
//             callback(null, user);
//          }
//       }).catch( function(err) {
//          callback(err,null);
//       });
// }));


passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.BASE_URL+"/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, callback) {
    db.user.findOrCreate({ twitterId: profile.id }, function (err, user) {
      console.log("TWITTER OK ",profile.id);
      return callback(err, user);
    });
  }
));



module.exports = passport;
