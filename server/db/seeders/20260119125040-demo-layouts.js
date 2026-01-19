'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const templates = await queryInterface.sequelize.query(
      `SELECT id, name FROM "Templates" ORDER BY id;`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    if (templates.length === 0) {
      console.log('No templates found. Please seed templates first.');
      return;
    }

    const now = new Date();
    const layouts = [];

    templates.forEach((template, index) => {
      // Макет 1: Минималистичный
      layouts.push({
        name: 'Минималистичный',
        description: 'Чистый дизайн с фокусом на продукт',
        templateId: template.id,
        canvasData: JSON.stringify({
          version: '5.3.0',
          objects: [
            {
              type: 'rect',
              left: 0,
              top: 0,
              width: 900,
              height: 1200,
              fill: '#ffffff',
              selectable: false,
            },
            {
              type: 'textbox',
              left: 50,
              top: 50,
              width: 800,
              fontSize: 72,
              fontFamily: 'Arial',
              fontWeight: 'bold',
              fill: '#000000',
              text: 'НОВИНКА',
              textAlign: 'center',
            },
            {
              type: 'textbox',
              left: 50,
              top: 950,
              width: 800,
              fontSize: 48,
              fontFamily: 'Arial',
              fill: '#333333',
              text: 'Название товара',
              textAlign: 'center',
            },
            {
              type: 'textbox',
              left: 50,
              top: 1050,
              width: 800,
              fontSize: 64,
              fontFamily: 'Arial',
              fontWeight: 'bold',
              fill: '#e74c3c',
              text: '1 999 ₽',
              textAlign: 'center',
            },
          ],
        }),
        preview: `https://via.placeholder.com/600x800/ffffff/000000?text=Minimal+${
          index + 1
        }`,
        isDefault: index === 0,
        createdAt: now,
        updatedAt: now,
      });

      // Макет 2: Яркий акцент
      layouts.push({
        name: 'Яркий акцент',
        description: 'Привлекающий внимание дизайн с цветными блоками',
        templateId: template.id,
        canvasData: JSON.stringify({
          version: '5.3.0',
          objects: [
            {
              type: 'rect',
              left: 0,
              top: 0,
              width: 900,
              height: 1200,
              fill: '#f8f9fa',
              selectable: false,
            },
            {
              type: 'rect',
              left: 0,
              top: 0,
              width: 900,
              height: 200,
              fill: '#3498db',
              selectable: true,
            },
            {
              type: 'textbox',
              left: 50,
              top: 50,
              width: 800,
              fontSize: 64,
              fontFamily: 'Arial',
              fontWeight: 'bold',
              fill: '#ffffff',
              text: 'СКИДКА -50%',
              textAlign: 'center',
            },
            {
              type: 'rect',
              left: 0,
              top: 1000,
              width: 900,
              height: 200,
              fill: '#e74c3c',
              selectable: true,
            },
            {
              type: 'textbox',
              left: 50,
              top: 1050,
              width: 800,
              fontSize: 72,
              fontFamily: 'Arial',
              fontWeight: 'bold',
              fill: '#ffffff',
              text: '999 ₽',
              textAlign: 'center',
            },
          ],
        }),
        preview: `https://via.placeholder.com/600x800/3498db/ffffff?text=Bright+${
          index + 1
        }`,
        isDefault: false,
        createdAt: now,
        updatedAt: now,
      });

      // Макет 3: Премиум
      layouts.push({
        name: 'Премиум',
        description: 'Элегантный дизайн для премиальных товаров',
        templateId: template.id,
        canvasData: JSON.stringify({
          version: '5.3.0',
          objects: [
            {
              type: 'rect',
              left: 0,
              top: 0,
              width: 900,
              height: 1200,
              fill: '#2c3e50',
              selectable: false,
            },
            {
              type: 'rect',
              left: 50,
              top: 50,
              width: 800,
              height: 1100,
              fill: 'transparent',
              stroke: '#ecf0f1',
              strokeWidth: 3,
              selectable: true,
            },
            {
              type: 'textbox',
              left: 100,
              top: 100,
              width: 700,
              fontSize: 56,
              fontFamily: 'Georgia',
              fontStyle: 'italic',
              fill: '#ecf0f1',
              text: 'Premium Quality',
              textAlign: 'center',
            },
            {
              type: 'textbox',
              left: 100,
              top: 950,
              width: 700,
              fontSize: 48,
              fontFamily: 'Georgia',
              fill: '#ecf0f1',
              text: 'Название товара',
              textAlign: 'center',
            },
            {
              type: 'textbox',
              left: 100,
              top: 1050,
              width: 700,
              fontSize: 56,
              fontFamily: 'Georgia',
              fontWeight: 'bold',
              fill: '#f39c12',
              text: '4 999 ₽',
              textAlign: 'center',
            },
          ],
        }),
        preview: `https://via.placeholder.com/600x800/2c3e50/ecf0f1?text=Premium+${
          index + 1
        }`,
        isDefault: false,
        createdAt: now,
        updatedAt: now,
      });

      // Макет 4: Современный
      layouts.push({
        name: 'Современный',
        description: 'Трендовый дизайн с градиентами',
        templateId: template.id,
        canvasData: JSON.stringify({
          version: '5.3.0',
          objects: [
            {
              type: 'rect',
              left: 0,
              top: 0,
              width: 900,
              height: 1200,
              fill: '#ffffff',
              selectable: false,
            },
            {
              type: 'circle',
              left: -100,
              top: -100,
              radius: 300,
              fill: '#e8f4f8',
              selectable: true,
            },
            {
              type: 'circle',
              left: 700,
              top: 1000,
              radius: 250,
              fill: '#fef5e7',
              selectable: true,
            },
            {
              type: 'textbox',
              left: 50,
              top: 100,
              width: 800,
              fontSize: 80,
              fontFamily: 'Arial',
              fontWeight: 'bold',
              fill: '#2c3e50',
              text: 'ХИТ',
              textAlign: 'center',
            },
            {
              type: 'textbox',
              left: 50,
              top: 950,
              width: 800,
              fontSize: 44,
              fontFamily: 'Arial',
              fill: '#34495e',
              text: 'Описание товара',
              textAlign: 'center',
            },
            {
              type: 'textbox',
              left: 50,
              top: 1050,
              width: 800,
              fontSize: 68,
              fontFamily: 'Arial',
              fontWeight: 'bold',
              fill: '#16a085',
              text: '2 499 ₽',
              textAlign: 'center',
            },
          ],
        }),
        preview: `https://via.placeholder.com/600x800/e8f4f8/2c3e50?text=Modern+${
          index + 1
        }`,
        isDefault: false,
        createdAt: now,
        updatedAt: now,
      });
    });

    await queryInterface.bulkInsert('Layouts', layouts, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Layouts', null, {});
  },
};
