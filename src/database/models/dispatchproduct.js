'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DispatchProduct extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DispatchProduct.init({
    dispatchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dispatches',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'company_has_product',
        key: 'id'
      }
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: 1,
          msg: 'La cantidad no puede ser menor a 1'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'DispatchProduct',
    tableName: 'dispatch_has_product',
    paranoid: true
  });
  return DispatchProduct;
};