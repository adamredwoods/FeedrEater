const express = require("express");
const passport = require("../config/passportConfig");
const db = require('../models');
const router = express.Router();
const isLoggedIn = require("../middleware/isLoggedIn");
const request = require("request");

router.get("/", isLoggedIn, function(req,res) {
   var rssList = [];
   db.rssuser.findAll({
      where: {userId: req.user.id},
      include: [db.rsslist]
   }).then( function(list) {
      console.log("list..........",list);
      res.render("user/index", {rssList:list, user:req.user.id});
   }).catch( function(err) {

   });
   res.render("user/index", {rssList:rssList, user:req.user.id});
});

router.get("/logout", function(req,res) {
   req.logout();
   req.flash("success","logged out");
   res.render("user");
});

router.post("/add", isLoggedIn, function(req,res) {
   if (req.body.rsslink) {
      console.log("rss link ",req.body.rsslink);
      db.rsslist.findAll({
         where: { id: req.user.id },
         include: [db.rsslist]
      }).then( function(links){
         res.send("found links, need to search");
      }).catch( function(err){
         //--not found, ok to add

         //--grab XML data

         db.rsslist.create({
            url: req.body.rsslink,
            title: xmlParser.getTitle()
         }).then(function(link) {

         }).catch(function(err){
            console.log(err);
         })
         console.log(err);
         res.send("add");
      });
   } else {
      res.end();
   }
});

module.exports = router;
