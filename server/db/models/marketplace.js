'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Marketplace extends Model {
    static associate(models) {
      Marketplace.hasMany(models.Template, { foreignKey: 'marketplaceId', as: 'templates' });
      Marketplace.hasMany(models.ProductCard, { foreignKey: 'marketplaceId', as: 'productCards' });
    }
  }
  Marketplace.init({
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    requirements: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Marketplace',
  });
  return Marketplace;
};
