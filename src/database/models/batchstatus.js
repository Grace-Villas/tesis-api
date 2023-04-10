'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BatchStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Batch}) {
      // define association here
      this.hasMany(Batch, { foreignKey: 'statusId', as: 'batches' });
    }
  }
  BatchStatus.init({
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
    modelName: 'BatchStatus',
    tableName: 'batch_statuses',
    paranoid: true
  });
  return BatchStatus;
};