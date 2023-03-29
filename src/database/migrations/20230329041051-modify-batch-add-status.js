'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('batches', 'statusId', {
      after: 'userId',
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'batch_statuses',
        key: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('batches', 'statusId');
  }
};
