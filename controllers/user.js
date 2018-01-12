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
      //console.log("list..........",list.rsslists.length);
      if (list.length===0) {
         list = [];
      }

      //-- get rss feed
      var feed =[];
      // var lastone = list.rsslists.length-1;

      //--new lists, clear client side cache
      io.sockets.emit("clearcache");

      for (let i=0; i<list.rsslists.length; i++) {
         //--this rss.get could use an LRU cache
         rss.get(list.rsslists[i].url, function(err,xml) {
            if(!err) {
               var rssdata = xmlParser.getItemList(xml);

               for(let j=0; j<rssdata.length; j++) {
                  feed.push(rssdata[i]);
               }
               //-- use sockets, global io
               io.sockets.emit("update", rssdata);

            } else {
               console.log("error ",err);
               // res.req("error","ERROR: "+err);
               //res.render("user/index",{rssList:[], user:0});
            }
         });
      }

      res.render("user/index", {rssList:list.rsslists.length, user:req.user.name});

      if (lastone=== -1) {
         //res.render("user/index", {rssList:feed, user:req.user.name});
      }

   }).catch( function(err) {
      req.flash("error",err);
      io.sockets.emit("savecache"); //--soft reload
      res.render("user/index", {rssList:1, user:req.user.name});

   });
});

router.get("/logout", function(req,res) {
   req.logout();
   req.flash("success","logged out");
   res.render("home");
});

router.get("/add", isLoggedIn, function(req,res) {
   res.redirect("/user");
});

router.post("/add", isLoggedIn, function(req,res) {

   //-- check which input is coming in
   if(!req.body.rsslink) {
      //-- check input link for valid rss
      //console.log(req.body.rsslinktxt);
      rss.checkUrl(req.body.rsslinktxt, function(err, check){
         if (check) {
            addLink(req,res, req.body.rsslinktxt);
         } else {
            console.log("Not valid url.");
            req.flash("Not a valid url.");

            io.sockets.emit("savecache"); //--soft reload
            res.render("user/index", {rssList:1, user:req.user.name});

         }
      });
   } else {
      addLink(req,res, req.body.rsslink);
   }
});

function addLink(req,res, link) {
   if (link) {

      console.log("add rss link ",link);

      db.rsslist.findAll({
         where: { url: link },
         include: [{model:db.user, where: {id: req.user.id}}]
      }).then( function(links){

         //--already added?
         if(links.length>0) {
            res.end();
         } else {

            //--not added
            console.log("not found, ok to add..........");
            //-- get rss data
            rss.get(link, function(err, data) {
               //console.log(xmlParser.getTitle(data));
               db.rsslist.create({
                  url: link,
                  title: xmlParser.getTitle(data)
               }).then(function(rssData) {
                  //-- create join between tables
                  db.rssuser.create({
                     userId: req.user.id,
                     rssId: rssData.id
                  }).then( function(d) {
                     //-- add rsslink success
                     req.flash("success","add success");
                     res.render("user/index");
                  }).catch( function(err) {
                     req.flash("error","db add error "+err+"     \n "+err.msg);
                     res.render("user/index");
                  });

               }).catch(function(err){
                  console.log(err);
                  req.flash("error","db error "+err);
                  res.render("user/index");
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
};

router.get("/rsslist", isLoggedIn, function(req,res) {

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
      req.flash("error","DB error");
      res.render("user/index", {user:req.user.name});
   });

});

module.exports = router;
