'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Layout extends Model {
    static associate(models) {
      Layout.belongsTo(models.Template, { foreignKey: 'templateId', as: 'template' });
    }
  }

  Layout.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      templateId: DataTypes.INTEGER,
      canvasData: DataTypes.JSON,
      preview: DataTypes.STRING,
      isDefault: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Layout',
    },
  );

  return Layout;
};
