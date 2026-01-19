'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Users');

    // Добавляем emailVerified, если его нет
    if (!tableDescription.emailVerified) {
      await queryInterface.addColumn('Users', 'emailVerified', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      });
    }

    // Добавляем verificationToken, если его нет
    if (!tableDescription.verificationToken) {
      await queryInterface.addColumn('Users', 'verificationToken', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // Добавляем verificationTokenExpires, если его нет
    if (!tableDescription.verificationTokenExpires) {
      await queryInterface.addColumn('Users', 'verificationTokenExpires', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Users');

    if (tableDescription.emailVerified) {
      await queryInterface.removeColumn('Users', 'emailVerified');
    }
    if (tableDescription.verificationToken) {
      await queryInterface.removeColumn('Users', 'verificationToken');
    }
    if (tableDescription.verificationTokenExpires) {
      await queryInterface.removeColumn('Users', 'verificationTokenExpires');
    }
  },
};
