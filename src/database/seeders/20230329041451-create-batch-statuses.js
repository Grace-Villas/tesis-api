'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const batchStatuses = [
      { name: 'pendiente', number: 1 },
      { name: 'en transito', number: 2 },
      { name: 'finalizado', number: 3 }
    ];

    await queryInterface.bulkInsert('batch_statuses', batchStatuses.map(status => ({
      ...status,
      createdAt: new Date(),
      updatedAt: new Date()
    })), {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET foreign_key_checks = 0');
    await queryInterface.bulkDelete('batch_statuses', null, {});
    await queryInterface.sequelize.query('SET foreign_key_checks = 1');
  }
};
