var passport = require("passport");
var localStrategy = require("passport-local").Strategy;
var TwitterStrategy = require("passport-twitter").Strategy;
var db = require("../models");
require("dotenv").config;
var bcrypt = require("bcrypt");

function isValidPassword(user, passwordTyped) {
   return bcrypt.compareSync(passwordTyped, user.password);
}

passport.serializeUser(function(user, callback) {
   callback(null, user.id);
});

//-- gets the data object for the user
passport.deserializeUser(function(id, callback) {
   db.user.findById(id).then(function(user) {
      callback(null,user);
   }).catch(function(err){
      callback(err, null);
   });
});

passport.use(new localStrategy({
      usernameField: "email",
      passwordField: "password"
   }, function(email, password, callback) {
      db.user.findOne({
         where: { email:email }
      }).then( function(user) {
         if(!user|| !isValidPassword(user, password)) {
            callback(null,false);
         } else {
            callback(null, user);
         }
      }).catch( function(err) {
         callback(err,null);
      });
}));


passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.BASE_URL+"/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, callback) {
    process.nextTick( function() {
      db.user.findOne({
            where:{ twitterId: profile.id }
         }).then(function (user) {
            //console.log("TWITTER OK ",profile.id, " err",err," user",user);
            var photo, email;

            if(user) {
               //--returning user
               console.log(111);
               return callback(null, user);
            } else {

               if(profile.photos) {
                  photo = profile.photos[0].value;
               }
               if(profile.emails) {
                  email = profile.emails[0].value;
               }

               db.user.findOrCreate({
                  where: {twitterId: profile.id},
                  defaults: {
                     twitterId: profile.id,
                     email: email,
                     twitterToken: token,
                     name: profile.username,
                     profilePic: photo
                  }
               }).spread(
                  function(user, wasCreated) {
                     if(wasCreated) {
                        //-- new user

                        return callback(null, user);
                     } else {
                        //-- something wrong on our end
                        console.log("err",err);
                        return callback(err, user);
                     }
                  }
               ).catch(callback);

            }
         });
    });
   }
));



module.exports = passport;
