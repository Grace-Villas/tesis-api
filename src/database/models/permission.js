'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permissons extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({RolePermission}) {
      // define association here
      this.hasMany(RolePermission, { foreignKey: 'permissionId', as: 'roles' });
    }
  }
  Permissons.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Permission',
    tableName: 'permissions',
    paranoid: true
  });
  return Permissons;
};