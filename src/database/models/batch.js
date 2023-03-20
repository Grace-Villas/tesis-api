'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Batch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({User, Dispatch}) {
      // define association here
      this.belongsTo(User, { foreignKey: 'userId', as: 'carrier' });
      this.hasMany(Dispatch, { foreignKey: 'batchId', as: 'dispatches' });
    }
  }
  Batch.init({
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
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Batch',
    tableName: 'batches',
    paranoid: true
  });
  return Batch;
};