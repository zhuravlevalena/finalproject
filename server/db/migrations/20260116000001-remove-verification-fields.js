'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Удаляем колонки верификации, если они существуют
    const tableDescription = await queryInterface.describeTable('Users');
    
    if (tableDescription.verified) {
      await queryInterface.removeColumn('Users', 'verified');
    }
    if (tableDescription.verificationCode) {
      await queryInterface.removeColumn('Users', 'verificationCode');
    }
    if (tableDescription.verificationPageUrl) {
      await queryInterface.removeColumn('Users', 'verificationPageUrl');
    }
    if (tableDescription.verificationExpiresAt) {
      await queryInterface.removeColumn('Users', 'verificationExpiresAt');
    }
  },

  async down(queryInterface, Sequelize) {
    // Восстанавливаем колонки (на случай отката)
    await queryInterface.addColumn('Users', 'verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await queryInterface.addColumn('Users', 'verificationCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'verificationPageUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'verificationExpiresAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }
};
