'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.addColumn("users", "twitterId", Sequelize.STRING).then(function(){
      return queryInterface.addColumn("users", "twitterToken", Sequelize.STRING)
   });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.removeColumn("users", "twitterId").then(function(){
      return queryInterface.removeColumn("users", "twitterToken")
   });
  }
};
