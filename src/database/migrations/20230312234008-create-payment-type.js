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
        defaultValue: false
      },
      hasHolderName: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      hasHolderDni: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      hasAccountNumber: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      hasEmail: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      hasPhone: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      hasUser: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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