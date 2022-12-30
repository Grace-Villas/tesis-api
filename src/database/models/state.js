'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class State extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Country, City}) {
      // define association here
      this.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });
      this.hasMany(City, { foreignKey: 'stateId', as: 'cities' });
    }
  }
  State.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'countries',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'State',
    tableName: 'states',
    paranoid: true
  });
  return State;
};