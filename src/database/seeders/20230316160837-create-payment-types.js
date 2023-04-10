'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const paymentTypes = [
      {
        name: 'Transferencia',
        hasBankName: true,
        hasHolderName: true,
        hasHolderDni: true,
        hasAccountNumber: true,
        hasEmail: true
      },
      {
        name: 'Pago movil',
        hasBankName: true,
        hasHolderDni: true,
        hasPhone: true
      },
      {
        name: 'Zelle',
        hasHolderName: true,
        hasEmail: true
      },
      {
        name: 'Binance',
        hasUser: true,
        hasEmail: true,
        hasAccountNumber: true,
        hasPhone: true
      }
    ];

    await queryInterface.bulkInsert('payment_types', paymentTypes.map(per => ({
      ...per,
      createdAt: new Date(),
      updatedAt: new Date()
    })), {});
  },

  async down (queryInterface, Sequelize) {
    
    await queryInterface.sequelize.query('SET foreign_key_checks = 0');
    await queryInterface.bulkDelete('payment_types', null, {});
    await queryInterface.sequelize.query('SET foreign_key_checks = 1');
  }
};
