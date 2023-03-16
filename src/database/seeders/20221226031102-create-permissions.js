'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const permissions = [
      {
        name: 'users',
        showName: 'usuarios',
        isPublic: true
      },
      {
        name: 'roles',
        showName: 'roles',
        isPublic: true
      },
      {
        name: 'companies',
        showName: 'clientes',
        isPublic: false
      },
      {
        name: 'cities',
        showName: 'ciudades',
        isPublic: false
      },
      {
        name: 'states',
        showName: 'estados',
        isPublic: false
      },
      {
        name: 'countries',
        showName: 'países',
        isPublic: false
      }
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
