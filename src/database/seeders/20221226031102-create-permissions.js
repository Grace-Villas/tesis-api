'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const permissions = [
      {
        name: 'users',
        isPublic: true
      },
      {
        name: 'roles',
        isPublic: true
      },
      {
        name: 'companies',
        isPublic: false
      },
      {
        name: 'cities',
        isPublic: false
      },
      {
        name: 'states',
        isPublic: false
      },
      {
        name: 'countries',
        isPublic: false
      }
    ]

    await queryInterface.bulkInsert('permissions', permissions.map(per => ({
      name: per.name,
      isPublic: per.isPublic,
      createdAt: new Date(),
      updatedAt: new Date()
    })), {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};
