'use strict';
module.exports = (sequelize, DataTypes) => {
  var user = sequelize.define('user', {
    name: DataTypes.STRING,
    rssId: DataTypes.INTEGER,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    profileText: DataTypes.TEXT,
    profilePic: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return user;
};