'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CardVersions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      cardId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'ProductCards',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      version: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      canvasData: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      changeDescription: {
        type: Sequelize.STRING,
        comment: 'Описание изменений (опционально)',
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

    // Индексы для быстрого поиска
    await queryInterface.addIndex('CardVersions', ['cardId'], {
      name: 'idx_card_versions_card_id',
    });
    await queryInterface.addIndex('CardVersions', ['cardId', 'version'], {
      name: 'idx_card_versions_card_version',
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CardVersions');
  },
};
