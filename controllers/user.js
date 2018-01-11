const express = require("express");
const passport = require("../config/passportConfig");
const db = require('../models');
const router = express.Router();
const isLoggedIn = require("../middleware/isLoggedIn");
const rss = require("../middleware/rss");
const xmlParser = require("../middleware/xmlParser");

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
         where: { url: req.body.rsslink },
         include: [{model:db.user, where: {id: req.user.id}}]
      }).then( function(links){
         //console.log(links[0].users);
         //--already added?
         if(links.length>0) {
            res.end();
         } else {
            //--not added
            console.log("not found, ok to add..........");
            //-- get rss data 
            rss.get(req.body.rsslink, function(err, data) {
               console.log(xmlParser.getTitle(data));
               db.rsslist.create({
                  url: req.body.rsslink,
                  title: xmlParser.getTitle(data),

               }).then(function(rssData) {
                  //-- create join between tables
                  db.rssuser.create({
                     userId: req.user.id,
                     rssId: rssData.id
                  }).then( function(d) {
                     res.send("add success");
                  }).catch( function(err) {
                     res.send("db add error "+err+"     \n "+err.msg);
                  });

               }).catch(function(err){
                  console.log(err);
                  res.send("error");
               })
               console.log(err);
            });
         }
      }).catch( function(err){
         //
         console.log("db search error..........");
         //--grab XML data
         //rss.get(req.body.rsslink, function(err, data) {
            //console.log(xmlParser.getTitle(data));
            // db.rsslist.create({
            //    url: req.body.rsslink,
            //    title: xmlParser.getTitle(data),
            //
            // }).then(function(rssData) {
            //    //-- create join between tables
            //    db.rssuser.create({
            //       userId: req.user.id,
            //       rssId: rssData.id
            //    }).then( function(d) {
            //       res.send("add success");
            //    }).catch( function(err) {
            //       res.send("db add error "+err+"     \n "+err.msg);
            //    });
            //
            // }).catch(function(err){
            //    console.log(err);
            //    res.send("error");
            // })
            //console.log(err);

         //});

      });
   } else {
      res.end();
   }
});

module.exports = router;
