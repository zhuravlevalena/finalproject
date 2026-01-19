'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Получаем ID маркетплейсов
    const marketplaces = await queryInterface.sequelize.query(
      `SELECT id, slug FROM "Marketplaces" ORDER BY id;`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    if (marketplaces.length === 0) {
      console.log('No marketplaces found. Please seed marketplaces first.');
      return;
    }

    const now = new Date();
    const templates = [];

    marketplaces.forEach((marketplace) => {
      // Шаблон 1: Электроника
      templates.push({
        name: 'Электроника и гаджеты',
        description: 'Шаблоны для электроники, смартфонов, наушников и других гаджетов',
        marketplaceId: marketplace.id,
        canvasData: null,
        preview: null,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      });

      // Шаблон 2: Одежда
      templates.push({
        name: 'Одежда и обувь',
        description: 'Шаблоны для одежды, обуви и аксессуаров',
        marketplaceId: marketplace.id,
        canvasData: null,
        preview: null,
        isDefault: false,
        createdAt: now,
        updatedAt: now,
      });

      // Шаблон 3: Косметика
      templates.push({
        name: 'Косметика и уход',
        description: 'Шаблоны для косметики, парфюмерии и средств по уходу',
        marketplaceId: marketplace.id,
        canvasData: null,
        preview: null,
        isDefault: false,
        createdAt: now,
        updatedAt: now,
      });

      // Шаблон 4: Дом и интерьер
      templates.push({
        name: 'Дом и интерьер',
        description: 'Шаблоны для товаров для дома, мебели и декора',
        marketplaceId: marketplace.id,
        canvasData: null,
        preview: null,
        isDefault: false,
        createdAt: now,
        updatedAt: now,
      });
    });

    await queryInterface.bulkInsert('Templates', templates, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Templates', null, {});
  },
};
