'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Template extends Model {
    static associate(models) {
      Template.belongsTo(models.Marketplace, { foreignKey: 'marketplaceId', as: 'marketplace' });
      Template.hasMany(models.ProductCard, { foreignKey: 'templateId', as: 'productCards' });
    }
  }
  Template.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    marketplaceId: DataTypes.INTEGER,
    canvasData: DataTypes.JSON,
    preview: DataTypes.STRING,
    isDefault: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Template',
  });
  return Template;
};
