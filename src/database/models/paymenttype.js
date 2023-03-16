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
      this.hasMany(PaymentMethod, { foreignKey: 'payment_type_id', as: 'paymentMethods' });
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
      defaultValue: true
    },
    hasHolderName: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    hasHolderDni: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    hasAccountNumber: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    hasEmail: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    hasPhone: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    hasUser: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'PaymentType',
    tableName: 'payment_types'
  });
  return PaymentType;
};