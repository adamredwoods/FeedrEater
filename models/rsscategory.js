'use strict';
module.exports = (sequelize, DataTypes) => {
  var rsscategory = sequelize.define('rsscategory', {
    rssId: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return rsscategory;
};
