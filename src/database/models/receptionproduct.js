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
    static associate(models) {
      // define association here
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
    companyProductId: {
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
      defaultValue: 0,
      validate: {
        min: {
          args: 1,
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