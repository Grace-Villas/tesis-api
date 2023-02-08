'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'name');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'name', {
      after: 'companyId',
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
