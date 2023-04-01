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
      this.belongsTo(PaymentType, { foreignKey: 'paymentTypeId', as: 'paymentType' });
    }
  }
  PaymentMethod.init({
    paymentTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'payment_types',
        key: 'id'
      }
    },
    bankName: {
      type: DataTypes.STRING
    },
    holderName: {
      type: DataTypes.STRING
    },
    holderDni: {
      type: DataTypes.STRING
    },
    accountNumber: {
      type: DataTypes.STRING
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