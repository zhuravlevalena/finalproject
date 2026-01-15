'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductCards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      marketplaceId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Marketplaces',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      templateId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Templates',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      productProfileId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ProductProfiles',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      canvasData: {
        type: Sequelize.JSON,
      },
      imageId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Images',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      generatedImageId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Images',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.ENUM('draft', 'completed'),
        defaultValue: 'draft',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ProductCards');
  },
};
