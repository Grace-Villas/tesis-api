'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Dispatch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Company, User, Receiver, Batch, DispatchStatus, DispatchProduct}) {
      // define association here
      this.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
      this.belongsTo(User, { foreignKey: 'userId', as: 'applicant' });
      this.belongsTo(Receiver, { foreignKey: 'receiverId', as: 'receiver' });
      this.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });
      this.belongsTo(DispatchStatus, { foreignKey: 'statusId', as: 'status' });
      this.hasMany(DispatchProduct, { foreignKey: 'dispatchId', as: 'products' });
    }
  }
  Dispatch.init({
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
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'receivers',
        key: 'id'
      }
    },
    batchId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'batches',
        key: 'id'
      }
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dispatch_estatuses',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Dispatch',
    tableName: 'dispatches',
    paranoid: true
  });
  return Dispatch;
};