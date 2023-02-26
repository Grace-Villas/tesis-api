'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reception_product_billings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      receptionProductId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'reception_has_product',
          key: 'id'
        }
      },
      dateIn: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      dateOut: {
        type: Sequelize.DATEONLY
      },
      qtyLeft: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: {
            args: 0,
            msg: 'La cantidad restante no puede ser negativa'
          }
        }
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
    await queryInterface.dropTable('reception_product_billings');
  }
};