const express = require("express");
const passport = require("../config/passportConfig");
const db = require('../models');
const router = express.Router();
const isLoggedIn = require("../middleware/isLoggedIn");
const rss = require("../middleware/rss");
const xmlParser = require("../middleware/xmlParser");
const mustache = require("mustache");

router.get("/", isLoggedIn, function(req,res) {

   db.user.findOne({
      where: {id: req.user.id},
      include: [db.rsslist]
   }).then( function(list) {
      //console.log("list..........",list.rsslists.length);
      if (list.length===0) {
         list = [];
      }

      //-- get rss feed
      res.render("user/index", {rssList:list.rsslists.length, user:req.user.name});

         //--new lists, clear client side cache
         //io.sockets.emit("clearcache");
         req.session.rssTotal = list.rsslists.length;
         req.session.rssdata = [];

         for (let i=0; i<list.rsslists.length; i++) {
            //--this rss.get could use an LRU cache
            process.nextTick( ()=> {
               rss.getRss(list.rsslists[i].url, function(err, xml) {
                  if(!err) {
                     var rssdata = xmlParser.getItemList(xml);

                     //-- use sockets, global io
                     //--spacing out our emits, so client does not miss any
                     // var int = setInterval(()=>{
                     //    io.sockets.emit("update", rssdata);
                     //    clearInterval(int);
                     // }, 50*i);

                     req.session.rssdata.push(rssdata);
                     req.session.save(); //--explicitly needed, otherwise session data is lost

                  } else {
                     console.log("error ",err);
                     // res.req("error","ERROR: "+err);
                     //res.render("user/index",{rssList:[], user:0});
                  }
               });
            });
         }

   }).catch( function(err) {
      console.log("db error",  err);
      var alerts = {"error": err};
      //io.sockets.emit("savecache"); //--soft reload
      res.render("user/index", {rssList:1, user:req.user.name, alerts});
   });
});

//-- maintain our memory cache of rss data here
router.get("/feeddata", isLoggedIn, function(req,res) {
   let obj = {"total":req.session.rssTotal};

   if (req.session.rssdata.length>0) {
      obj.data = req.session.rssdata.pop();
      //-- decrease total
      req.session.rssTotal--;
   } else {
      req.session.rssTotal=0;
   }
   res.send(obj);
})

router.get("/logout", isLoggedIn, function(req,res) {
   req.logout();
   var alerts = {"success": "User is logged out"};
   res.render("home", {alerts});
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

            var alerts = {"error": "Not a valid URL"};

            //io.sockets.emit("savecache"); //--soft reload
            //res.render("user/index", {rssList:1, user:req.user.name, alerts});
            res.end();
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
            var alerts = {"error": "RSS feed exists in list"};
            req.flash("error",alerts.error);
            res.redirect("/user");
         } else {

            //--not added
            console.log("not found, ok to add..........");
            //-- get rss data
            rss.getRss(link, function(err, data) {
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
                     var alerts = {"success": "New RSS added to list"};
                     req.flash("success",alerts.success);
                     res.redirect("/user");
                     //res.render("user/index", {alerts});
                  }).catch( function(err) {
                     var alerts = {"error": "DB add error "+err};
                     res.render("user/index", {alerts});
                  });

               }).catch(function(err){
                  console.log(err);
                  var alerts = {"error": "DB error "+err};
                  res.render("user/index", {alerts});
               })
               console.log(err);
            });
         }
      }).catch( function(err){
         //
         console.log("db search error..........",err);
      });
   } else {
      res.end();
   }
};



module.exports = router;
