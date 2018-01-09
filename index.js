require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');
const flash = require("connect-flash");
const isLoggedIn = require("./middleware/isLoggedIn");
const passport = require("./config/passportConfig");
const session = require("express-session");
const app = express();
const mustache = require("mustache-express");
const isLoggedIn = require("./middleware/isLoggedIn");


app.engine("mustache", mustache());
app.set("view engine", "mustache");
app.use(express.static(__dirname+"/public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(mustache);
app.use(session({
   secret: process.env.SESSION_SECRET,
   resave: false,
   saveUninitialized: true
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res, next) {
      res.locals.currentUser = req.user;
      res.locals.alerts = req.flash();
      next();
});

app.use("/auth", require("./controllers/auth"));

app.router("/", function(req,res) {
   res.send("made it here");
});
