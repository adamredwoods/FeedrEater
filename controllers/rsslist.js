const express = require("express");
const passport = require("../config/passportConfig");
const db = require('../models');
const router = express.Router();
const isLoggedIn = require("../middleware/isLoggedIn");
const rss = require("../middleware/rss");
const mustache = require("mustache");

router.get("/", isLoggedIn, function(req,res) {

   db.user.findAll({
      where: { id: req.user.id},
      include: [db.rsslist]
   }).then( function(user){
      var index=0;
      res.render("user/rsslist", {
         rsslist:user[0].rsslists,
         user:req.user.name,
         index: function() {
           return ++index;
         }
      });
   }).catch( function(err) {
      var alerts = {"error": "DB error "+err};
      res.render("user/index", {user:req.user.name, alerts});
   });

});


module.exports = router;
