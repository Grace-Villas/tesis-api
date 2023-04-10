'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const permissions = [
      { name: 'users', showName: 'usuarios', isPublic: true },
      { name: 'roles', showName: 'roles', isPublic: true },
      { name: 'companies', showName: 'clientes', isPublic: false },
      { name: 'cities', showName: 'ciudades', isPublic: false },
      { name: 'states', showName: 'estados', isPublic: false },
      { name: 'countries', showName: 'países', isPublic: false },
      { name: 'products', showName: 'productos', isPublic: true },
      { name: 'receptions', showName: 'envíos', isPublic: true },
      { name: 'receivers', showName: 'destinatarios', isPublic: true },
      { name: 'batches', showName: 'lotes', isPublic: false },
      { name: 'dispatches', showName: 'despachos', isPublic: true },
      { name: 'config', showName: 'configuraciones', isPublic: false },
      { name: 'payment-methods', showName: 'métodos de pago', isPublic: false },
      { name: 'payments', showName: 'pagos', isPublic: true },
    ];

    await queryInterface.bulkInsert('permissions', permissions.map(per => ({
      name: per.name,
      showName: per.showName,
      isPublic: per.isPublic,
      createdAt: new Date(),
      updatedAt: new Date()
    })), {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET foreign_key_checks = 0');
    await queryInterface.bulkDelete('permissions', null, {});
    await queryInterface.sequelize.query('SET foreign_key_checks = 1');
  }
};
