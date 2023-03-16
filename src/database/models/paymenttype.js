'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({PaymentMethod}) {
      // define association here
      this.hasMany(PaymentMethod, { foreignKey: 'paymentTypeId', as: 'paymentMethods' });
    }
  }
  PaymentType.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hasBankName: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    hasHolderName: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    hasHolderDni: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    hasAccountNumber: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    hasEmail: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    hasPhone: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    hasUser: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  }, {
    sequelize,
    modelName: 'PaymentType',
    tableName: 'payment_types'
  });
  return PaymentType;
};