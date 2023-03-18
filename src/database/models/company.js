'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({User, Role, City, CompanyProduct, Reception}) {
      // define association here
      this.hasMany(User, { foreignKey: 'companyId', as: 'users' });
      this.hasMany(Role, { foreignKey: 'companyId', as: 'roles' });
      this.belongsTo(City, { foreignKey: 'cityId', as: 'city' });
      this.hasMany(CompanyProduct, { foreignKey: 'companyId', as: 'companyProducts' });
      this.hasMany(Reception, { foreignKey: 'companyId', as: 'receptions' });
    }
  }
  Company.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rut: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cities',
        key: 'id'
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: {
          msg: 'El número de teléfono solo puede contener números'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'El correo electrónico debe tener un formato válido'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Company',
    tableName: 'companies',
    paranoid: true
  });
  return Company;
};