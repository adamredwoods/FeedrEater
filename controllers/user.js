const express = require("express");
const passport = require("../config/passportConfig");
const db = require('../models');
const router = express.Router();
const isLoggedIn = require("../middleware/isLoggedIn");
const rss = require("../middleware/rss");
const xmlParser = require("../middleware/xmlParser");
const mustache = require("mustache");

router.get("/", isLoggedIn, function(req,res) {

   var isRendering =0;

   db.user.findOne({
      where: {id: req.user.id},
      include: [db.rsslist]
   }).then( function(list) {
      console.log("list..........",list.rsslists.length);
      if (list.length===0) {
         list = [];
      }

      //-- get rss feed
      var feed =[];
      var lastone = list.rsslists.length-1;

      for (let i=0; i<list.rsslists.length; i++) {
         rss.get(list.rsslists[i].url, function(err,xml) {
            if(!err) {
               var rssdata = xmlParser.getItemList(xml);

               for(let j=0; j<rssdata.length; j++) {
                  feed.push(rssdata[i]);
               }
               //-- use sockets
               io.sockets.emit("update", rssdata);

            } else {
               console.log("error ",err);
               // res.req("error","ERROR: "+err);
               //res.render("user/index",{rssList:[], user:0});
            }
         });
      }

      //res.render("user/index", {rssList:feed, user:req.user.id});

      if (lastone=== -1) {
         //res.render("user/index", {rssList:feed, user:req.user.name});
      }

   }).catch( function(err) {
      req.flash("error",err);
      res.render("user/index",{rssList:[], user:req.user.name});
   });
});

router.get("/logout", function(req,res) {
   req.logout();
   req.flash("success","logged out");
   res.render("user");
});

router.post("/add", isLoggedIn, function(req,res) {
   if (req.body.rsslink) {

      console.log("add rss link ",req.body.rsslink);
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
               //console.log(xmlParser.getTitle(data));
               db.rsslist.create({
                  url: req.body.rsslink,
                  title: xmlParser.getTitle(data)
               }).then(function(rssData) {
                  //-- create join between tables
                  db.rssuser.create({
                     userId: req.user.id,
                     rssId: rssData.id
                  }).then( function(d) {
                     //-- add rsslink success
                     req.flash("success","add success");
                     res.render("/user/index");
                  }).catch( function(err) {
                     req.flash("error","db add error "+err+"     \n "+err.msg);
                     res.render("/user/index");
                  });

               }).catch(function(err){
                  console.log(err);
                  req.flash("error","db error "+err);
                  res.render("/user/index");
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
