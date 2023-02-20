'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Role, Permission}) {
      // define association here
      this.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
      this.belongsTo(Permission, { foreignKey: 'permissionId', as: 'permission' });
    }
  }
  RolePermission.init({
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id'
      }
    },
    list: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    create: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    edit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    delete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'RolePermission',
    tableName: 'role_has_permission',
    paranoid: true
  });
  return RolePermission;
};