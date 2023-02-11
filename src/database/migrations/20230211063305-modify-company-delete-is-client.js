'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('companies', 'isClient');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('companies', 'isClient', {
      after: 'email',
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  }
};
