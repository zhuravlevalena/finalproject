'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductCard extends Model {
    static associate(models) {
      ProductCard.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      ProductCard.belongsTo(models.Marketplace, { foreignKey: 'marketplaceId', as: 'marketplace' });
      ProductCard.belongsTo(models.Template, { foreignKey: 'templateId', as: 'template' });
      ProductCard.belongsTo(models.ProductProfile, { foreignKey: 'productProfileId', as: 'productProfile' });
      ProductCard.belongsTo(models.Image, { foreignKey: 'imageId', as: 'image' });
      ProductCard.belongsTo(models.Image, { foreignKey: 'generatedImageId', as: 'generatedImage' });
    }
  }
  ProductCard.init({
    userId: DataTypes.INTEGER,
    marketplaceId: DataTypes.INTEGER,
    templateId: DataTypes.INTEGER,
    productProfileId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    canvasData: DataTypes.JSON,
    imageId: DataTypes.INTEGER,
    generatedImageId: DataTypes.INTEGER,
    status: DataTypes.ENUM('draft', 'completed')
  }, {
    sequelize,
    modelName: 'ProductCard',
  });
  return ProductCard;
};
