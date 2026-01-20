'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.ProductCard, { foreignKey: 'userId', as: 'productCards' });
      User.hasMany(models.ProductProfile, {
        foreignKey: 'userId',
        as: 'productProfiles',
      });
      User.hasMany(models.Image, { foreignKey: 'userId', as: 'images' });
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      hashpass: DataTypes.STRING,
      role: DataTypes.STRING,
      nsfwConsent: DataTypes.BOOLEAN,
      googleId: DataTypes.STRING,
      emailVerified: DataTypes.BOOLEAN,
      verificationToken: DataTypes.STRING,
      verificationTokenExpires: DataTypes.DATE,
      birthDate: DataTypes.DATEONLY,
      gender: DataTypes.STRING,
      phone: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'User',
    },
  );
  return User;
};
