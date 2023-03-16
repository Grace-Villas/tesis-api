'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentMethod extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({PaymentType}) {
      // define association here
      this.belongsTo(PaymentType, { foreignKey: 'payment_type_id', as: 'paymentType' });
    }
  }
  PaymentMethod.init({
    paymentTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'payment_type_id',
      references: {
        model: 'payment_types',
        key: 'id'
      }
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'bank_name'
    },
    holderName: {
      type: DataTypes.STRING,
      field: 'holder_name'
    },
    holderDni: {
      type: DataTypes.STRING,
      field: 'holder_dni'
    },
    accountNumber: {
      type: DataTypes.STRING,
      field: 'account_number'
    },
    email: {
      type: DataTypes.STRING
    },
    phone: {
      type: DataTypes.STRING
    },
    user: {
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'PaymentMethod',
    tableName: 'payment_methods',
    paranoid: true
  });
  return PaymentMethod;
};