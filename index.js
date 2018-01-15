require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');
const flash = require("connect-flash");
const passport = require("./config/passportConfig");
const session = require("express-session");

const mustache = require("mustache-express");
const isLoggedIn = require("./middleware/isLoggedIn");
const socket = require("socket.io");

var app = express();

app.engine("mustache", mustache());
app.set("view engine", "mustache");
app.set("view cache", false);

app.set('views', __dirname + '/views');
app.set('public', __dirname + '/public');
app.use(express.static(__dirname+"/public"));

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(mustache); //--problem!

app.use(session({
   secret: process.env.SESSION_SECRET,
   resave: false,
   saveUninitialized: true
}));

app.use(flash()); //--only works on redirects
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res, next) {
      res.locals.currentUser = req.user;
      res.locals.alerts = req.flash();
      next();
});

app.use("/auth", require("./controllers/auth"));
app.use("/user", require("./controllers/user"));
app.use("/rsslist", require("./controllers/rsslist"));

app.get("/", function(req,res) {
   let name="";
   if (req.user) name = req.user.name;
   res.render("home", {user: name, login:true});
});

server = app.listen(process.env.PORT || 3000);
global.io = socket(server);
