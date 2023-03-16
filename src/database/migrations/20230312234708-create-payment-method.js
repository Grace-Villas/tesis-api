'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_methods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      paymentTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'payment_type_id',
        references: {
          model: 'payment_types',
          key: 'id'
        }
      },
      bankName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'bank_name'
      },
      holderName: {
        type: Sequelize.STRING,
        field: 'holder_name'
      },
      holderDni: {
        type: Sequelize.STRING,
        field: 'holder_dni'
      },
      accountNumber: {
        type: Sequelize.STRING,
        field: 'account_number'
      },
      email: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      user: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('payment_methods');
  }
};