'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const templates = await queryInterface.sequelize.query(
      `SELECT id, name, "isDefault" FROM "Templates" ORDER BY id;`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    console.log(`[Seeder] Found ${templates.length} templates:`, templates.map(t => ({ id: t.id, name: t.name })));

    if (templates.length === 0) {
      console.log('No templates found. Please seed templates first.');
      return;
    }

    const now = new Date();
    const layouts = [];

    templates.forEach((template) => {
      console.log(
        `[Seeder] Creating layouts for template ${template.id} (${template.name}), isDefault=${template.isDefault}`,
      );

      if (template.isDefault) {
        // 1. МАКЕТ: "TECH SPEC" (Технологичный акцент)
        // Фокус на характеристиках с использованием линий-указателей
        layouts.push({
          name: 'Tech Spec Design',
          description: 'Современный макет с выносками характеристик и геометричными формами',
          templateId: template.id,
          canvasData: JSON.stringify({
            version: '5.3.0',
            objects: [
              { type: 'rect', left: 0, top: 0, width: 900, height: 1200, fill: '#F4F7F6', selectable: false, evented: false },
              // Декоративный элемент сзади
              { type: 'rect', left: 450, top: 0, width: 450, height: 1200, fill: '#E8EDEB', selectable: false, evented: false },
              // Вертикальный текст (Бренд или Категория)
              { 
                type: 'textbox', 
                left: 820, 
                top: 1150, 
                width: 1100, 
                fontSize: 140, 
                fontFamily: 'Montserrat, Arial', 
                fontWeight: '900', 
                fill: '#000000', 
                text: 'PREMIUM', 
                textAlign: 'right', 
                angle: -90, 
                opacity: 0.05,
                selectable: true,
                evented: true
              },
              // Линия-выноска 1
              { 
                type: 'line', 
                x1: 250, 
                y1: 400, 
                x2: 100, 
                y2: 350, 
                stroke: '#2D3436', 
                strokeWidth: 2,
                left: 100,
                top: 350,
                selectable: true,
                evented: true
              },
              { 
                type: 'textbox', 
                left: 50, 
                top: 310, 
                width: 250, 
                fontSize: 24, 
                fontFamily: 'Arial', 
                fontWeight: 'bold', 
                fill: '#2D3436', 
                text: 'ДЫШАЩИЙ\nМАТЕРИАЛ', 
                textAlign: 'left',
                selectable: true,
                evented: true
              },
              // Линия-выноска 2
              { 
                type: 'line', 
                x1: 650, 
                y1: 800, 
                x2: 800, 
                y2: 850, 
                stroke: '#2D3436', 
                strokeWidth: 2,
                left: 650,
                top: 800,
                selectable: true,
                evented: true
              },
              { 
                type: 'textbox', 
                left: 600, 
                top: 860, 
                width: 250, 
                fontSize: 24, 
                fontFamily: 'Arial', 
                fontWeight: 'bold', 
                fill: '#2D3436', 
                text: 'УСИЛЕННАЯ\nФИКСАЦИЯ', 
                textAlign: 'right',
                selectable: true,
                evented: true
              },
              // Блок с размерами (информационный, не цена)
              { 
                type: 'rect', 
                left: 50, 
                top: 1080, 
                width: 200, 
                height: 60, 
                fill: '#2D3436', 
                rx: 10,
                ry: 10,
                selectable: true,
                evented: true
              },
              { 
                type: 'textbox', 
                left: 50, 
                top: 1095, 
                width: 200, 
                fontSize: 28, 
                fontFamily: 'Arial', 
                fontWeight: 'bold', 
                fill: '#FFFFFF', 
                text: '36 — 45', 
                textAlign: 'center',
                selectable: true,
                evented: true
              },
              { 
                type: 'textbox', 
                left: 50, 
                top: 1150, 
                width: 200, 
                fontSize: 18, 
                fontFamily: 'Arial', 
                fill: '#636E72', 
                text: 'РАЗМЕРНЫЙ РЯД', 
                textAlign: 'center', 
                charSpacing: 100,
                selectable: true,
                evented: true
              }
            ]
          }),
          preview: `https://via.placeholder.com/600x800/F4F7F6/2D3436?text=Tech+Spec`,
          isDefault: false, 
          createdAt: now, 
          updatedAt: now
        });

        // 2. МАКЕТ: "MINIMAL ELEGANCE" (Чистый стиль)
        // Использование мягких теней (через прозрачность) и акцент на преимуществах
        layouts.push({
          name: 'Minimal Elegance',
          description: 'Элегантный макет с акцентом на состав и комфорт',
          templateId: template.id,
          canvasData: JSON.stringify({
            version: '5.3.0',
            objects: [
              { type: 'rect', left: 0, top: 0, width: 900, height: 1200, fill: '#FFFFFF', selectable: false, evented: false },
              // Боковая плашка для преимуществ
              { 
                type: 'rect', 
                left: 0, 
                top: 0, 
                width: 80, 
                height: 1200, 
                fill: '#2D3436',
                selectable: true,
                evented: true
              },
              { 
                type: 'textbox', 
                left: -560, 
                top: 40, 
                width: 1200, 
                fontSize: 20, 
                fontFamily: 'Arial', 
                fill: '#FFFFFF', 
                text: 'QUALITY GUARANTEED • NATURAL MATERIALS • ERGONOMIC DESIGN', 
                textAlign: 'center', 
                angle: -90, 
                charSpacing: 200,
                selectable: true,
                evented: true
              },
              // Основной заголовок характеристика
              { 
                type: 'textbox', 
                left: 130, 
                top: 80, 
                width: 700, 
                fontSize: 50, 
                fontFamily: 'Georgia, serif', 
                fontWeight: 'bold', 
                fill: '#2D3436', 
                text: 'АНАТОМИЧЕСКАЯ ФОРМА', 
                textAlign: 'left',
                selectable: true,
                evented: true
              },
              { 
                type: 'rect', 
                left: 130, 
                top: 150, 
                width: 100, 
                height: 4, 
                fill: '#2D3436',
                selectable: true,
                evented: true
              },
              // Иконки-характеристики (имитация)
              { 
                type: 'circle', 
                left: 130, 
                top: 950, 
                radius: 40, 
                fill: '#F2F2F2',
                selectable: true,
                evented: true
              },
              { 
                type: 'textbox', 
                left: 180, 
                top: 965, 
                width: 300, 
                fontSize: 22, 
                fontFamily: 'Arial', 
                fontWeight: 'bold', 
                fill: '#2D3436', 
                text: 'ЛЕГКИЙ ВЕС (250г)', 
                textAlign: 'left',
                selectable: true,
                evented: true
              },
              { 
                type: 'circle', 
                left: 130, 
                top: 1050, 
                radius: 40, 
                fill: '#F2F2F2',
                selectable: true,
                evented: true
              },
              { 
                type: 'textbox', 
                left: 180, 
                top: 1065, 
                width: 300, 
                fontSize: 22, 
                fontFamily: 'Arial', 
                fontWeight: 'bold', 
                fill: '#2D3436', 
                text: 'ГИБКАЯ ПОДОШВА', 
                textAlign: 'left',
                selectable: true,
                evented: true
              }
            ]
          }),
          preview: `https://via.placeholder.com/600x800/FFFFFF/2D3436?text=Minimal+Elegance`,
          isDefault: false, 
          createdAt: now, 
          updatedAt: now
        });

        // 3. МАКЕТ: "MODERN GRID" (Сетка и блоки)
        // Яркий, современный, разделенный на смысловые зоны
        layouts.push({
          name: 'Modern Grid',
          description: 'Блочный дизайн для выделения ключевых особенностей',
          templateId: template.id,
          canvasData: JSON.stringify({
            version: '5.3.0',
            objects: [
              { type: 'rect', left: 0, top: 0, width: 900, height: 1200, fill: '#1E272E', selectable: false, evented: false },
              // Верхний блок для названия модели
              { 
                type: 'rect', 
                left: 40, 
                top: 40, 
                width: 820, 
                height: 120, 
                fill: 'transparent', 
                stroke: '#485460', 
                strokeWidth: 1,
                selectable: true,
                evented: true
              },
              { 
                type: 'textbox', 
                left: 60, 
                top: 75, 
                width: 780, 
                fontSize: 40, 
                fontFamily: 'Impact, sans-serif', 
                fill: '#FFFFFF', 
                text: 'DAILY COMFORT SERIES', 
                textAlign: 'center', 
                charSpacing: 300,
                selectable: true,
                evented: true
              },
              // Инфо-плашки снизу
              { 
                type: 'rect', 
                left: 40, 
                top: 950, 
                width: 390, 
                height: 200, 
                fill: '#485460', 
                rx: 20,
                ry: 20,
                selectable: true,
                evented: true
              },
              { 
                type: 'textbox', 
                left: 60, 
                top: 980, 
                width: 350, 
                fontSize: 24, 
                fontFamily: 'Arial', 
                fontWeight: 'bold', 
                fill: '#05C46B', 
                text: 'МАТЕРИАЛЫ:', 
                textAlign: 'left',
                selectable: true,
                evented: true
              },
              { 
                type: 'textbox', 
                left: 60, 
                top: 1020, 
                width: 350, 
                fontSize: 20, 
                fontFamily: 'Arial', 
                fill: '#D2DAE2', 
                text: '• Натуральная кожа\n• Эко-мех\n• Текстиль', 
                textAlign: 'left',
                selectable: true,
                evented: true
              },
              { 
                type: 'rect', 
                left: 470, 
                top: 950, 
                width: 390, 
                height: 200, 
                fill: '#485460', 
                rx: 20,
                ry: 20,
                selectable: true,
                evented: true
              },
              { 
                type: 'textbox', 
                left: 490, 
                top: 980, 
                width: 350, 
                fontSize: 24, 
                fontFamily: 'Arial', 
                fontWeight: 'bold', 
                fill: '#05C46B', 
                text: 'СЕЗОН:', 
                textAlign: 'left',
                selectable: true,
                evented: true
              },
              { 
                type: 'textbox', 
                left: 490, 
                top: 1020, 
                width: 350, 
                fontSize: 20, 
                fontFamily: 'Arial', 
                fill: '#D2DAE2', 
                text: 'Демисезон / Весна\nТемпературный режим\nот -5°C до +15°C', 
                textAlign: 'left',
                selectable: true,
                evented: true
              }
            ]
          }),
          preview: `https://via.placeholder.com/600x800/1E272E/FFFFFF?text=Modern+Grid`,
          isDefault: false, 
          createdAt: now, 
          updatedAt: now
        });
      } else {
        // Категорийные макеты — по одному простому макету на каждую категорию
        layouts.push({
          name: `${template.name} — базовый макет`,
          description: `Базовый макет для категории "${template.name}"`,
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
                evented: false,
              },
              {
                type: 'textbox',
                left: 50,
                top: 80,
                width: 800,
                fontSize: 56,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fill: '#000000',
                text: template.name,
                textAlign: 'center',
                selectable: true,
                evented: true,
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
                selectable: true,
                evented: true,
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
                text: '9 999 ₽',
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
      }
    });

    console.log(`[Seeder] Creating ${layouts.length} layouts for ${templates.length} templates`);
    if (layouts.length > 0) {
      await queryInterface.bulkInsert('Layouts', layouts, {});
      console.log(`[Seeder] Successfully created ${layouts.length} layouts`);
    } else {
      console.log('[Seeder] No layouts to create!');
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Layouts', null, {});
  },
};
