'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Company, PaymentStatus, PaymentMethod}) {
      // define association here
      this.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
      this.belongsTo(PaymentStatus, { foreignKey: 'statusId', as: 'status' });
      this.belongsTo(PaymentMethod, { foreignKey: 'paymentMethodId', as: 'paymentMethod' });
    }
  }
  Payment.init({
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'payment_statuses',
        key: 'id'
      }
    },
    paymentMethodId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'payment_methods',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    reference: {
      type: DataTypes.STRING
    },
    issuingName: {
      type: DataTypes.STRING
    },
    issuingEmail: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          msg: 'El correo es inválido'
        }
      }
    },
    comments: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    paranoid: true
  });
  return Payment;
};