'use strict';
module.exports = (sequelize, DataTypes) => {
  var category = sequelize.define('category', {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.category.belongsToMany(models.rsscategy, {through: models.rsslist, foreignKey: "categoryId"})
      }
    }
  });
  return category;
};
