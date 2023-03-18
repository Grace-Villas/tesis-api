'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reception extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Company, User, ReceptionProduct}) {
      // define association here
      this.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
      this.belongsTo(User, { foreignKey: 'userId', as: 'consignee' });
      this.hasMany(ReceptionProduct, { foreignKey: 'receptionId', as: 'products' });
    }
  }
  Reception.init({
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Reception',
    tableName: 'receptions',
    paranoid: true
  });
  return Reception;
};