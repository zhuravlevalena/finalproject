'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CardVersion extends Model {
    static associate(models) {
      CardVersion.belongsTo(models.ProductCard, { 
        foreignKey: 'cardId', 
        as: 'card' 
      });
    }
  }
  CardVersion.init({
    cardId: DataTypes.INTEGER,
    version: DataTypes.INTEGER,
    canvasData: DataTypes.JSONB,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    changeDescription: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CardVersion',
    tableName: 'CardVersions',
  });
  return CardVersion;
};
