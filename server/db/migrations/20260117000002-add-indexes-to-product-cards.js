'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Индекс для userId (основной фильтр)
    await queryInterface.addIndex('ProductCards', ['userId'], {
      name: 'idx_product_cards_user_id',
    });

    // Индекс для title (поиск по названию) - обычный B-tree индекс
    await queryInterface.addIndex('ProductCards', ['title'], {
      name: 'idx_product_cards_title',
    });

    // Индекс для status (фильтрация по статусу)
    await queryInterface.addIndex('ProductCards', ['status'], {
      name: 'idx_product_cards_status',
    });

    // Индекс для marketplaceId (фильтрация по маркетплейсу)
    await queryInterface.addIndex('ProductCards', ['marketplaceId'], {
      name: 'idx_product_cards_marketplace_id',
    });

    // Составной индекс для userId + status (часто используется вместе)
    await queryInterface.addIndex('ProductCards', ['userId', 'status'], {
      name: 'idx_product_cards_user_status',
    });

    // Индекс для createdAt (сортировка)
    await queryInterface.addIndex('ProductCards', ['createdAt'], {
      name: 'idx_product_cards_created_at',
    });

    // Составной индекс для userId + createdAt (сортировка карточек пользователя)
    await queryInterface.addIndex('ProductCards', ['userId', 'createdAt'], {
      name: 'idx_product_cards_user_created',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('ProductCards', 'idx_product_cards_user_id');
    await queryInterface.removeIndex('ProductCards', 'idx_product_cards_title');
    await queryInterface.removeIndex('ProductCards', 'idx_product_cards_status');
    await queryInterface.removeIndex('ProductCards', 'idx_product_cards_marketplace_id');
    await queryInterface.removeIndex('ProductCards', 'idx_product_cards_user_status');
    await queryInterface.removeIndex('ProductCards', 'idx_product_cards_created_at');
    await queryInterface.removeIndex('ProductCards', 'idx_product_cards_user_created');
  },
};
