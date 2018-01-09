'use strict';
module.exports = (sequelize, DataTypes) => {
  var rsslist = sequelize.define('rsslist', {
    url: DataTypes.STRING,
    title: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return rsslist;
};
