'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      Image.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Image.hasMany(models.ProductCard, { foreignKey: 'imageId', as: 'cardsWithImage' });
      Image.hasMany(models.ProductCard, { foreignKey: 'generatedImageId', as: 'cardsWithGeneratedImage' });
    }
  }
  Image.init({
    userId: DataTypes.INTEGER,
    url: DataTypes.STRING,
    type: DataTypes.ENUM('uploaded', 'generated'),
    originalName: DataTypes.STRING,
    prompt: DataTypes.TEXT,
    metadata: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Image',
  });
  return Image;
};
