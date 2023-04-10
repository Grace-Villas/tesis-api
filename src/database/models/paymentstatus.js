'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Payment}) {
      // define association here
      this.hasMany(Payment, { foreignKey: 'statusId', as: 'payments' });
    }
  }
  PaymentStatus.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'El nombre ya se encuentra en uso'
      }
    }
  }, {
    sequelize,
    modelName: 'PaymentStatus',
    tableName: 'payment_statuses',
    paranoid: true
  });
  return PaymentStatus;
};