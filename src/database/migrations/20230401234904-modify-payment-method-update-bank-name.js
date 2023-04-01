'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('payment_methods', 'bankName', {
      type: Sequelize.STRING
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('payment_methods', 'bankName', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
