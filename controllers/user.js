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

      //--new lists, clear client side cache
      //io.sockets.emit("clearcache");

      req.session.rssTotal = list.rsslists.length;
      req.session.rssdata = [];

      for (let i=0; i<list.rsslists.length; i++) {
         //--this rss.get could use an LRU cache
         process.nextTick( ()=> {
            if (list.rsslists[i].url) {
               rss.getRss(list.rsslists[i].url, function(err, xml) {
                  if(!err) {
                     //-- passing user defined rank into object
                     var sourceRank = list.rsslists[i].rssuser.userRank;

                     var rssdata = xmlParser.getItemList(xml, sourceRank);

                     if(rssdata) {
                        req.session.rssdata.push(rssdata);
                        req.session.save(); //--explicitly needed, otherwise session data is lost
                     }

                  } else {
                     console.log("getRss error ",err);
                  }
               });
            }
         });
      }


      //-- get rss feed
      res.render("user/index", {rssList:list.rsslists.length, user:req.user.name});

   }).catch( function(err) {
      console.log("db error",  err);
      var alerts = {"error": err};
      //io.sockets.emit("savecache"); //--soft reload
      res.render("user/index", {rssList:1, user:req.user.name, alerts});
   });
});

//-- maintain our memory cache of rss data here
router.get("/feeddata", isLoggedIn, function(req,res) {
   let obj = {
      "total": req.session.rssTotal,
      data: {}
   };

   if (req.session.rssdata.length>0 && req.session.rssTotal>0) {
      obj.data = req.session.rssdata.pop();
      //-- decrease total
      console.log(req.session.rssTotal);
      //req.session.rssTotal--;
   } else {
      req.session.rssTotal=0;
   }
   res.send(obj);

})

router.get("/logout", isLoggedIn, function(req,res) {
   req.logout();
   var alerts = {"success": "User is logged out"};
   res.redirect("/");
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
            req.flash("error", alerts.error);
            res.redirect("/user", {rssList:1, user:req.user.name, alerts});
         }
      });
   } else {
      addLink(req,res, req.body.rsslink);
   }
});

function addLink(req,res, link) {
   if (link) {
      //--is this a valid rss?
      rss.getRss(link, function(err, data) {
         //if so, find or create it

         if (!err) {
            let title = xmlParser.getTitle(data);
            db.rsslist.findOrCreate({
               where: { url: link },
               defaults: {
                  title: title
               }
            }).spread( function(rsslist, wasCreated) {
               if (wasCreated) {
                  //make new url, then add to rssuser
                  addRssToUserDb(req,res,link,rsslist.id);
               } else {
                  //url exists elsewhere, does it exist in rssuser, if not add to rssuser
                  db.rssuser.findAll({
                     where: {rssId: rsslist.id, userId: req.user.id}
                  }).then( function(rsslinks) {
                     if(rsslinks.length>0) {
                        var alerts = {"error": "RSS feed exists in list"};
                        req.flash("error", alerts.error);
                        res.redirect("/user");
                     } else {
                        addRssToUserDb(req,res,link,rsslist.id);
                     }
                  }). catch(function(err) {
                     console.log(err);
                     var alerts = {"error": "DB error "+err};
                     res.render("user/index", {alerts});
                  })
               }
            }).catch( function(err) {
               console.log(err);
               var alerts = {"error": "DB error "+err};
               res.render("user/index", {alerts});
            });
         } else {
            console.log("invalid rss url");
            var alerts = {"error": "URL is not a valid RSS"};
            req.flash("error", alerts.error);
            res.redirect("/user");
         }
      });
   }

}


function addRssToUserDb(req, res, link, rssId) {
   //-- get count
   db.rssuser.count({where: {userId: req.user.id}}).then( function(rssTotal) {

         //-- create join between tables
         db.rssuser.create({
            userId: req.user.id,
            rssId: rssId,
            userRank: rssTotal+1
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
      //});
   }).catch( function (err) {
      console.log("DB error: rssuser add ",err);
   });

}





module.exports = router;
