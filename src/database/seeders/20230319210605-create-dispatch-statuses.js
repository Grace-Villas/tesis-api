'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const dispatchStatuses = [
      { name: 'solicitado', number: 1 },
      { name: 'agendado', number: 2 },
      { name: 'embarcado', number: 3 },
      { name: 'entregado', number: 4 },
      { name: 'cancelado', number: 0 },
      { name: 'denegado', number: 0 }
    ];

    await queryInterface.bulkInsert('dispatch_statuses', dispatchStatuses.map(status => ({
      ...status,
      createdAt: new Date(),
      updatedAt: new Date()
    })), {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET foreign_key_checks = 0');
    await queryInterface.bulkDelete('dispatch_statuses', null, {});
    await queryInterface.sequelize.query('SET foreign_key_checks = 1');
  }
};
