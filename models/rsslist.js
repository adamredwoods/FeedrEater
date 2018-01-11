'use strict';
module.exports = (sequelize, DataTypes) => {
  var rsslist = sequelize.define('rsslist', {
    url: DataTypes.STRING,
    title: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.rsslist.belongsToMany(models.user, {through:models.rssuser, foreignKey:"rssId"}),
        models.rsslist.belongsToMany(models.category, {through: models.rsscategory, foreignKey: "rssId"})
      }
    }
  });
  return rsslist;
};
