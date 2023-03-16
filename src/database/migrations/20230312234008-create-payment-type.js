'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_types', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      hasBankName: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      hasHolderName: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      hasHolderDni: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      hasAccountNumber: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      hasEmail: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      hasPhone: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      hasUser: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payment_types');
  }
};