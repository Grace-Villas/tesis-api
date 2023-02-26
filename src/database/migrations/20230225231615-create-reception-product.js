'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reception_has_product', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      receptionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'receptions',
          key: 'id'
        }
      },
      companyProductId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'company_has_product',
          key: 'id'
        }
      },
      qty: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: {
            args: 1,
            msg: 'La cantidad no puede ser menor a 1'
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
    await queryInterface.dropTable('reception_has_product');
  }
};