'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DispatchStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Dispatch}) {
      // define association here
      this.hasMany(Dispatch, { foreignKey: 'statusId', as: 'dispatches' });
    }
  }
  DispatchStatus.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'DispatchStatus',
    tableName: 'dispatch_statuses',
    paranoid: true
  });
  return DispatchStatus;
};