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

      // Дополнительный макет: Минималистичный с акцентом на название товара (templateId === 1)
      if (template.id === 1) {
        layouts.push({
          name: 'Минималистичный с акцентом на название товара',
          description: 'Чистый дизайн с крупным названием товара',
          templateId: template.id,
          canvasData: JSON.stringify({
            version: '5.3.0',
            objects: [
              // Фон
              {
                type: 'rect',
                left: 0,
                top: 0,
                width: 900,
                height: 1200,
                fill: '#ffffff',
                selectable: false,
                evented: false,
              },
              // Бейдж "ХИТ" в правом верхнем углу
              {
                type: 'rect',
                left: 650,
                top: 50,
                width: 180,
                height: 70,
                rx: 14,
                ry: 14,
                fill: '#FF6B00',
                selectable: true,
                evented: true,
              },
              {
                type: 'textbox',
                text: 'ХИТ',
                left: 650,
                top: 60,
                width: 180,
                fontSize: 36,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fill: '#ffffff',
                textAlign: 'center',
                selectable: true,
                evented: true,
              },
              // Область товара (изображение)
              {
                type: 'image',
                left: 100,
                top: 150,
                width: 700,
                height: 700,
                src: '/uploads/istockphoto-1436061606-612x612.jpg',
                originX: 'left',
                originY: 'top',
                scaleX: 1,
                scaleY: 1,
                selectable: true,
                evented: true,
              },
              // Название модели
              {
                type: 'textbox',
                text: 'Название модели',
                left: 50,
                top: 900,
                width: 800,
                fontSize: 40,
                fontFamily: 'Arial',
                fontWeight: 'normal',
                fill: '#555555',
                textAlign: 'center',
                selectable: true,
                evented: true,
              },
              // Полупрозрачная плашка
              {
                type: 'rect',
                left: 150,
                top: 1060,
                width: 600,
                height: 80,
                rx: 12,
                ry: 12,
                fill: '#00B23B',
                opacity: 0.08,
                selectable: true,
                evented: true,
              },
              {
                type: 'textbox',
                text: 'Для комфортного бега',
                left: 150,
                top: 1080,
                width: 600,
                fontSize: 32,
                fontFamily: 'Arial',
                fontWeight: 'normal',
                fill: '#1a1a1a',
                textAlign: 'center',
                selectable: true,
                evented: true,
              },
            ],
          }),
          preview: null,
          isDefault: false,
          createdAt: now,
          updatedAt: now,
        });
      
        layouts.push({
          name: 'Эстетичный спорт',
          description: 'Минималистичный дизайн в пастельных тонах с выносками характеристик',
          templateId: template.id,
          canvasData: JSON.stringify({
            version: '5.3.0',
            objects: [
              // Фон
              {
                type: 'rect',
                left: 0,
                top: 0,
                width: 900,
                height: 1200,
                fill: '#F2E9F2',
                selectable: false,
              },
              // Заголовок
              {
                type: 'textbox',
                left: 50,
                top: 80,
                width: 800,
                fontSize: 64,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fill: '#FFFFFF',
                text: 'КРОССОВКИ\nЖЕНСКИЕ',
                textAlign: 'center',
              },
              // Область с товаром (изображение)
              {
                type: 'image',
                left: 100,
                top: 180,
                width: 700,
                height: 700,
                src: '/uploads/istockphoto-1436061606-612x612.jpg',
                originX: 'left',
                originY: 'top',
                scaleX: 1,
                scaleY: 1,
                selectable: true,
                evented: true,
              },
              // Выноска 1
              {
                type: 'line',
                x1: 380,
                y1: 520,
                x2: 250,
                y2: 450,
                stroke: '#FFFFFF',
                strokeWidth: 2,
              },
              {
                type: 'textbox',
                left: 50,
                top: 420,
                width: 200,
                fontSize: 22,
                fontFamily: 'Arial',
                fontStyle: 'italic',
                fill: '#FFFFFF',
                text: 'Дышащий текстиль',
                textAlign: 'center',
              },
              // Выноска 2
              {
                type: 'line',
                x1: 550,
                y1: 750,
                x2: 680,
                y2: 820,
                stroke: '#FFFFFF',
                strokeWidth: 2,
              },
              {
                type: 'textbox',
                left: 650,
                top: 810,
                width: 220,
                fontSize: 22,
                fontFamily: 'Arial',
                fontStyle: 'italic',
                fill: '#FFFFFF',
                text: 'Амортизация подошвы',
                textAlign: 'center',
              },
              // Блок размерной сетки
              {
                type: 'rect',
                left: 50,
                top: 1050,
                width: 160,
                height: 80,
                fill: '#4A4A4A',
                rx: 20,
                ry: 20,
              },
              {
                type: 'textbox',
                left: 60,
                top: 1065,
                width: 140,
                fontSize: 32,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fill: '#FFFFFF',
                text: '36-45',
                textAlign: 'center',
              },
              {
                type: 'textbox',
                left: 50,
                top: 1140,
                width: 160,
                fontSize: 22,
                fontFamily: 'Arial',
                fill: '#4A4A4A',
                text: 'размерная сетка',
                textAlign: 'center',
              },
            ],
          }),
          preview: `https://via.placeholder.com/600x800/F2E9F2/4A4A4A?text=Sneaker+Card+${index + 1}`,
          isDefault: index === 0,
          createdAt: now,
          updatedAt: now,
        });
      }
    });

    await queryInterface.bulkInsert('Layouts', layouts, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Layouts', null, {});
  },
};
