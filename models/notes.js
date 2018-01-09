'use strict';
module.exports = (sequelize, DataTypes) => {
  var notes = sequelize.define('notes', {
    userId: DataTypes.INTEGER,
    url: DataTypes.STRING,
    notes: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return notes;
};
