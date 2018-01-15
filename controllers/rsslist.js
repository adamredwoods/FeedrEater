const express = require("express");
const passport = require("../config/passportConfig");
const db = require('../models');
const router = express.Router();
const isLoggedIn = require("../middleware/isLoggedIn");
const rss = require("../middleware/rss");
const mustache = require("mustache");

function getRssList(req,res, callback) {
   db.user.findAll({
      where: { id: req.user.id},
      include: [db.rsslist]
   }).then( function(user){
      callback(user[0].rsslists);
   }).catch( function(err) {
      var alerts = {"error": "DB error "+err};
      res.render("user/index", {user:req.user.name, alerts});
   });
}

router.get("/", isLoggedIn, function(req,res) {

   getRssList(req,res, function(data) {
      var index=0;
      data = data.sort( function(a,b) {
         if(!a.rssuser.userRank) a.rssuser.userRank = 9999;
         if(!b.rssuser.userRank) b.rssuser.userRank = 9999;
         return a.rssuser.userRank-b.rssuser.userRank;
      });

      res.render("user/rsslist", {
         rsslist:data,
         user:req.user.name,
         index: function() {
           return ++index;
         }
      });
   })

});

router.put("/", isLoggedIn, function(req,res) {
   db.rssuser.findAll({
      where: {
         userId: req.user.id
      }
   }).then( function(rssuser){
      //TODO: if nothing is ranked, need to fill in data now
      //TODO: if something lese is same rank, re-rank everything
      //everything is rank+b
      //new thing is rank+a
      //re-sort
      //re-rank with b
      //save

      var tlist = [];
      var tempItem, tnum=-1;

      for (let i=0; i<rssuser.length; i++) {
         console.log("....",rssuser[i].rssId,"  ",req.body.rssId);
         if (rssuser[i].rssId != req.body.rssId) {
            tlist.push({
               id: i,
               oldrank: rssuser[i].userRank,
               newrank: 0
            });
         } else {
            tnum = i;
            console.log(555);
         }
      }

      if (tnum===-1) {
         console.log("rsslist: rank sort error");
         res.end();
         return;
      }

      tlist.sort(function(a,b) {
         return a.oldrank-b.oldrank;
      });

      tlist.splice(req.body.newRank,0,{id: tnum, oldrank:0, newrank:0});
console.log(tlist);
      for (let i=0; i<tlist.length; i++) {
         tlist[i].newrank =i+1;
         console.log("newrank",i+1);
      }

      for(let j=0; j<rssuser.length; j++) {
         rssuser[j].userRank = tlist[j].newrank;
      }

      //rssuser.userRank = req.body.newRank;
      rssuser.save().then( function(e) {

         res.end();
      }).catch( function(err) {
         console.log("DB Save() error ",err);
         res.end();
      })
   }).catch( function(err) {
      var alerts = {"error": "DB error "+err};
      console.log("DB error ",alerts.error);
      res.end();
   });
})

router.post("/delete", isLoggedIn, function(req,res) {
   db.rsslist.destroy({
      where: {id: req.body.id},
      include: [db.user]
   }).then(function(data){
      var alerts = {"success":"Deleted RSS Feed"};

      process.nextTick( ()=> {
         var alerts = {"success":"Deleted RSS Feed"};
         req.method="get";
         res.redirect("/rsslist");
      });
   }).catch(function(error){
      console.log("DB error ",error);
      //res.redirect("/user");
   });

});

module.exports = router;
