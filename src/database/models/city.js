'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({State, Company}) {
      // define association here
      this.belongsTo(State, { foreignKey: 'stateId', as: 'state' });
      this.hasMany(Company, { foreignKey: 'cityId', as: 'companies' });
    }
  }
  City.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    stateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'states',
        key: 'id'
      }
    },
    hasDeliveries: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    deliveryPrice: {
      type: DataTypes.DECIMAL(10,2),
      validate: {
        min: {
          args: [0],
          msg: 'El precio de despacho debe ser mayor o igual a 0'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'City',
    tableName: 'cities',
    paranoid: true
  });
  return City;
};