'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const paymentStatuses = [
      { name: 'pendiente' },
      { name: 'denegado' },
      { name: 'aprobado' }
    ];

    await queryInterface.bulkInsert('payment_statuses', paymentStatuses.map(status => ({
      ...status,
      createdAt: new Date(),
      updatedAt: new Date()
    })), {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET foreign_key_checks = 0');
    await queryInterface.bulkDelete('payment_statuses', null, {});
    await queryInterface.sequelize.query('SET foreign_key_checks = 1');
  }
};
