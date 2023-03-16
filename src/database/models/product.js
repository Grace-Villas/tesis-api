'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({CompanyProduct}) {
      // define association here
      this.hasMany(CompanyProduct, { foreignKey: 'productId', as: 'companiesProduct' });
    }
  }
  Product.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    qtyPerPallet: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: 1,
          msg: 'La cantidad por paleta debe ser mayor a 0'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    paranoid: true
  });
  return Product;
};