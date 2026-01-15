'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductProfile extends Model {
    static associate(models) {
      ProductProfile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      ProductProfile.hasMany(models.ProductCard, { foreignKey: 'productProfileId', as: 'productCards' });
    }
  }
  ProductProfile.init({
    userId: DataTypes.INTEGER,
    productType: DataTypes.STRING,
    style: DataTypes.TEXT,
    targetAudience: DataTypes.TEXT,
    colorPalette: DataTypes.JSON,
    preferences: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'ProductProfile',
  });
  return ProductProfile;
};
