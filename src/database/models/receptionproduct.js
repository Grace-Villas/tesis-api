'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReceptionProduct extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Reception, Product}) {
      // define association here
      this.belongsTo(Reception, { foreignKey: 'receptionId', as: 'reception' });
      this.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
    }
  }
  ReceptionProduct.init({
    receptionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'receptions',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [1],
          msg: 'La cantidad no puede ser menor a 1'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'ReceptionProduct',
    tableName: 'reception_has_product',
    paranoid: true
  });
  return ReceptionProduct;
};