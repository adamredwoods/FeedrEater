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
   if (req.body.newRank<1) {
      res.end();
      return;
   }

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
         if (rssuser[i].rssId != req.body.rssId) {
            tlist.push({
               id: i,
               oldrank: rssuser[i].userRank,
               newrank: 0
            });
         } else {
            tnum = i;
         }
      }

      if (tnum===-1) {
         res.end();
         return;
      }

      tlist.sort(function(a,b) {
         return a.oldrank-b.oldrank;
      });

      tlist.splice(req.body.newRank-1,0,{id: tnum, oldrank:0, newrank:0});
console.log(tlist," ",req.body.newRank-1);
      for (let i=0; i<tlist.length; i++) {
         tlist[i].newrank =i+1;
      }

      //--TODO: HOW TO DO BULK SAVE PROMISES???
      for(let j=0; j<tlist.length; j++) {
         rssuser[tlist[j].id].userRank = tlist[j].newrank;
         rssuser[j].save();
      }


      res.end();

      //rssuser.userRank = req.body.newRank;
      // rssuser.save().then( function(e) {
      //
      //    res.end();
      // }).catch( function(err) {
      //    console.log("DB Save() error ",err);
      //    res.end();
      // })
   }).catch( function(err) {
      var alerts = {"error": "DB error "+err};
      console.log("DB error ",alerts.error);
      res.end();
   });
})

router.post("/delete", isLoggedIn, function(req,res) {
   db.rssuser.destroy({
      where: {
         rssId: req.body.id,
         userId: req.user.id
       }
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
