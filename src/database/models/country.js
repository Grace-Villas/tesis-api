'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Country extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({State}) {
      // define association here
      this.hasMany(State, { foreignKey: 'countryId', as: 'states' });
    }
  }
  Country.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    locale: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneExtension: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Country',
    tableName: 'countries',
    paranoid: true
  });
  return Country;
};