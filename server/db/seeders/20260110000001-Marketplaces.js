'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Marketplaces', [
      {
        name: 'Wildberries',
        slug: 'wildberries',
        requirements: 'Минимальный размер изображения: 1000x1000px. Формат: JPG, PNG. Максимальный размер файла: 5MB.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Ozon',
        slug: 'ozon',
        requirements: 'Минимальный размер изображения: 800x800px. Формат: JPG, PNG. Максимальный размер файла: 10MB.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Яндекс.Маркет',
        slug: 'yandex-market',
        requirements: 'Минимальный размер изображения: 1200x1200px. Формат: JPG, PNG. Максимальный размер файла: 5MB.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Marketplaces', null, {});
  },
};
