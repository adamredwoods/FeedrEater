const express = require("express");
const passport = require("../config/passportConfig");
const db = require('../models');
const router = express.Router();


router.get("/login", function(req,res) {
   res.render("auth/login");
});

router.post("/login", passport.authenticate("local", {
   successRedirect: "/user/index",
   successFlash: "Login Successful",
   failureRedirect: "/auth/login",
   failureFlash: "Invalid username or password."
}));

router.get("/signup", function(req,res){
   res.send ("auth signup");
});

router.post("/signup", function(req,res, next) {
   console.log("signup req.body is", req.body);
   // db.user.findOrCreate({
   //    where: {email: req.body.email},
   //    defaults: {
   //       username: req.body.username,
   //       firstname: req.body.firstname,
   //       lastname: req.body.lastname,
   //       password: req.body.password
   //    }
   // }).spread(function(user, wasCreated){
   //    if(wasCreated) {
   //       //was not found in database
   //       passport.authenticate("local", {
   //          successRedirect: "/profile",
   //          successFlash: "User created"
   //       })(req, res, next);
   //    } else {
   //       //-- duplicate user
   //       req.flash("error", "User exists, choose a different username");
   //       res.redirect("/auth/login"); //--can I just res.end here?
   //    }
   // }).catch(function(err) {
   //    req.flash("error", err.message);
   //    res.redirect("/auth/login");
   // })
});

router.get("/twitter", passport.authenticate("twitter"));

router.get("/twitter/callback", passport.authenticate("twitter", {
   successRedirect: "/user",
   successFlash: "You successfully logged in via Twitter",
   failureRedirect: "/auth/login",
   failureFlash: "You tried but Twitter failure"
}));

router.get("/logout", function(req,res){
   req.logout();
   req.flash("success","Logout success.");
   res.redirect("/");
});

module.exports = router;
