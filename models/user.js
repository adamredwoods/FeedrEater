'use strict';
module.exports = (sequelize, DataTypes) => {
  var user = sequelize.define('user', {
    name: DataTypes.STRING,
    rssId: DataTypes.INTEGER,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    profileText: DataTypes.TEXT,
    profilePic: DataTypes.TEXT,
    twitterId: DataTypes.STRING,
    twitterToken: DataTypes.STRING
});

   user.associate= function(models) {
     models.user.belongsToMany(models.rsslist, {through: models.rssuser, foreignKey: "userId"}),
     models.user.hasMany(models.notes, {foreignKey: "userId"})
   };

  return user;
};
