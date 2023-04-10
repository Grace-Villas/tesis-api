'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReceptionProductBilling extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ReceptionProduct}) {
      // define association here
      this.belongsTo(ReceptionProduct, { foreignKey: 'receptionProductId', as: 'receptionProduct' });
    }
  }
  ReceptionProductBilling.init({
    receptionProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'reception_has_product',
        key: 'id'
      }
    },
    dateIn: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    dateOut: {
      type: DataTypes.DATEONLY
    },
    qtyLeft: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'La cantidad restante no puede ser negativa'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'ReceptionProductBilling',
    tableName: 'reception_product_billings',
    paranoid: true,
    validate: {
      dateOutAfterDateIn() {
        if (this.dateOut && !this.dateOut.isAfter(this.dateIn)) {
          throw new Error('La fecha en la que se acabó la paleta no puede ser anterior a la fecha en la que llegó');
        }
      }
    }
  });
  return ReceptionProductBilling;
};