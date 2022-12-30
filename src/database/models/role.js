'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({Company, UserRole, RolePermission}) {
      // define association here
      this.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
      this.hasMany(UserRole, { foreignKey: 'roleId', as: 'userRoles' });
      this.hasMany(RolePermission, { foreignKey: 'roleId', as: 'rolePermissions' });
    }
  }
  Role.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hexColor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    companyId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    paranoid: true
  });
  return Role;
};