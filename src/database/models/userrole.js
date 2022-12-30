'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({User, Role}) {
      // define association here
      this.belongsTo(User, { foreignKey: 'userId', as: 'user' });
      this.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
    }
  }
  UserRole.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:  {
        model: 'users',
        key: 'id'
      }
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:  {
        model: 'roles',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'UserRole',
    tableName: 'user_has_role',
    paranoid: true
  });
  return UserRole;
};