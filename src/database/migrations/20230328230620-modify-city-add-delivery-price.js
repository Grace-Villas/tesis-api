'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('cities', 'deliveryPrice', {
      after: 'hasDeliveries',
      type: Sequelize.DECIMAL(10,2),
      validate: {
        min: {
          args: [0],
          msg: 'El precio de despacho debe ser mayor o igual a 0'
        },
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('cities', 'deliveryPrice');
  }
};
