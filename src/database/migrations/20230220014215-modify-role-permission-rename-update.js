'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('role_has_permission', 'update', 'edit');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('role_has_permission', 'edit', 'update');
  }
};
