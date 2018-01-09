module.exports = function(req, res, next) {

   if(!req.user) {
      req.flash("error","Login required.");
      res.redirect("/auth/login");
   } else {
      next();
   }
}
