'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const templates = await queryInterface.sequelize.query(
      `SELECT id, name, "isDefault" FROM "Templates" ORDER BY id;`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    console.log(
      `[Seeder] Found ${templates.length} templates:`,
      templates.map((t) => ({ id: t.id, name: t.name })),
    );

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
        // ==================================================================================
        // СУЩЕСТВУЮЩИЕ МАКЕТЫ ИЗ ПРИМЕРА
        // ==================================================================================

        // 1. УНИВЕРСАЛЬНЫЙ МАКЕТ: "ELEGANT GRADIENT"
        layouts.push({
          name: 'Elegant Gradient',
          description: 'Элегантный градиентный макет с акцентом на продукт',
          templateId: template.id,
          canvasData: JSON.stringify({
            version: '5.3.0',
            objects: [
              // Градиентный фон
              {
                type: 'rect', left: 0, top: 0, width: 900, height: 600, fill: '#667EEA', selectable: false, evented: false,
              },
              {
                type: 'rect', left: 0, top: 600, width: 900, height: 600, fill: '#764BA2', selectable: false, evented: false,
              },
              // Декоративные круги
              {
                type: 'circle', left: -100, top: -100, radius: 200, fill: 'rgba(255, 255, 255, 0.1)', selectable: false, evented: false,
              },
              {
                type: 'circle', left: 700, top: 900, radius: 250, fill: 'rgba(255, 255, 255, 0.08)', selectable: false, evented: false,
              },
              // Основной заголовок
              {
                type: 'textbox', left: 50, top: 950, width: 800, fontSize: 48, fontFamily: 'Arial', fontWeight: 'bold', fill: '#FFFFFF', text: 'НАЗВАНИЕ ТОВАРА', textAlign: 'left', selectable: true, evented: true,
              },
              // Описание
              {
                type: 'textbox', left: 50, top: 1020, width: 800, fontSize: 22, fontFamily: 'Arial', fill: 'rgba(255, 255, 255, 0.9)', text: 'Высокое качество • Современный дизайн', textAlign: 'left', selectable: true, evented: true,
              },
            ],
          }),
          preview: null, isDefault: false, createdAt: now, updatedAt: now,
        });

        // 2. УНИВЕРСАЛЬНЫЙ МАКЕТ: "MINIMAL LUXURY"
        layouts.push({
          name: 'Minimal Luxury',
          description: 'Минималистичный макет с крупной типографикой',
          templateId: template.id,
          canvasData: JSON.stringify({
            version: '5.3.0',
            objects: [
              {
                type: 'rect', left: 0, top: 0, width: 900, height: 1200, fill: '#FFFFFF', selectable: false, evented: false,
              },
              {
                type: 'rect', left: 40, top: 40, width: 820, height: 1120, fill: 'transparent', stroke: '#000000', strokeWidth: 2, selectable: false, evented: false,
              },
              {
                type: 'rect', left: 80, top: 80, width: 150, height: 4, fill: '#000000', selectable: true, evented: true,
              },
              {
                type: 'textbox', left: 80, top: 100, width: 740, fontSize: 16, fontFamily: 'Arial', fill: '#666666', text: 'КОЛЛЕКЦИЯ 2026', textAlign: 'left', charSpacing: 200, selectable: true, evented: true,
              },
              {
                type: 'textbox', left: 80, top: 950, width: 740, fontSize: 52, fontFamily: 'Georgia, serif', fontWeight: 'bold', fill: '#000000', text: 'НАЗВАНИЕ\nТОВАРА', textAlign: 'left', selectable: true, evented: true,
              },
              {
                type: 'textbox', left: 80, top: 1070, width: 740, fontSize: 18, fontFamily: 'Arial', fill: '#666666', text: 'Эксклюзивное качество\nПремиальные материалы', textAlign: 'left', selectable: true, evented: true,
              },
            ],
          }),
          preview: null, isDefault: false, createdAt: now, updatedAt: now,
        });

        // 3. УНИВЕРСАЛЬНЫЙ МАКЕТ: "MODERN BOLD"
        layouts.push({
          name: 'Modern Bold',
          description: 'Яркий современный макет с геометрическими элементами',
          templateId: template.id,
          canvasData: JSON.stringify({
            version: '5.3.0',
            objects: [
              {
                type: 'rect', left: 0, top: 0, width: 900, height: 1200, fill: '#1A1A2E', selectable: false, evented: false,
              },
              {
                type: 'rect', left: 0, top: 0, width: 900, height: 300, fill: '#FF6B6B', selectable: false, evented: false,
              },
              {
                type: 'rect', left: -200, top: 200, width: 1300, height: 200, fill: '#4ECDC4', angle: -15, selectable: false, evented: false,
              },
              {
                type: 'rect', left: 50, top: 50, width: 120, height: 50, fill: '#FFFFFF', rx: 5, ry: 5, selectable: true, evented: true,
              },
              {
                type: 'textbox', left: 50, top: 62, width: 120, fontSize: 20, fontFamily: 'Arial', fontWeight: 'bold', fill: '#1A1A2E', text: 'NEW', textAlign: 'center', selectable: true, evented: true,
              },
              {
                type: 'textbox', left: 50, top: 900, width: 800, fontSize: 56, fontFamily: 'Impact, Arial', fill: '#FFFFFF', text: 'НАЗВАНИЕ ТОВАРА', textAlign: 'left', selectable: true, evented: true,
              },
              {
                type: 'textbox', left: 50, top: 990, width: 800, fontSize: 20, fontFamily: 'Arial', fill: '#4ECDC4', text: '✓ Инновационный дизайн  ✓ Высокое качество  ✓ Гарантия', textAlign: 'left', selectable: true, evented: true,
              },
            ],
          }),
          preview: null, isDefault: false, createdAt: now, updatedAt: now,
        });

        // ==================================================================================
        // НОВЫЕ СОВРЕМЕННЫЕ, ОБЪЕМНЫЕ МАКЕТЫ
        // ==================================================================================

        // 4. НОВЫЙ МАКЕТ: "FLOATING DEPTH CARD" (Парящая карточка с тенями)
        layouts.push({
          name: 'Floating Depth Card',
          description: 'Многослойный макет с имитацией объема и теней',
          templateId: template.id,
          canvasData: JSON.stringify({
            version: '5.3.0',
            objects: [
              // Фон (базовый слой)
              {
                type: 'rect', left: 0, top: 0, width: 900, height: 1200, fill: '#EDF1F4', selectable: false, evented: false,
              },
              // Декоративный фоновый элемент (для глубины)
              {
                type: 'circle', left: 500, top: 100, radius: 300, fill: '#E2E7EC', selectable: false, evented: false,
              },
              // Имитация тени для основной карточки (смещение + прозрачность)
              {
                type: 'rect', left: 65, top: 165, width: 770, height: 970, fill: 'rgba(0,0,0,0.08)', rx: 30, ry: 30, selectable: false, evented: false,
              },
              // Основная "парящая" карточка (белая)
              {
                type: 'rect', left: 50, top: 150, width: 770, height: 970, fill: '#FFFFFF', rx: 30, ry: 30, selectable: false, evented: false,
              },
              // Верхний акцентный блок внутри карточки
              {
                type: 'rect', left: 50, top: 150, width: 770, height: 200, fill: '#F8FAFC', rx: 30, ry: 30, selectable: false, evented: false,
                clipPath: { type: 'rect', left: 50, top: 150, width: 770, height: 170, rx: 30, ry: 30 } // Обрезка снизу
              },
               // Заголовок
              {
                type: 'textbox', left: 100, top: 220, width: 670, fontSize: 44, fontFamily: 'Arial Black, Arial', fill: '#2D3748', text: 'MODERN PRODUCT', textAlign: 'left', selectable: true, evented: true,
              },
               // Подзаголовок / Категория
              {
                type: 'textbox', left: 100, top: 180, width: 670, fontSize: 18, fontFamily: 'Arial', fill: '#718096', text: 'PREMIUM COLLECTION', textAlign: 'left', charSpacing: 150, selectable: true, evented: true,
              },
              // Нижний блок с информацией
              {
                type: 'textbox', left: 100, top: 980, width: 670, fontSize: 32, fontFamily: 'Arial', fontWeight: 'bold', fill: '#2D3748', text: 'Ключевая особенность', textAlign: 'left', selectable: true, evented: true,
              },
              {
                type: 'textbox', left: 100, top: 1030, width: 670, fontSize: 20, fontFamily: 'Arial', fill: '#718096', text: 'Подробное описание преимущества товара, которое создает ценность для клиента.', textAlign: 'left', selectable: true, evented: true,
              },
              // Декоративная "кнопка" или акцент внизу (имитация объема градиентом)
              {
                  type: 'rect', left: 600, top: 1000, width: 180, height: 60, rx: 30, ry: 30,
                  fill: { type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 60 }, colorStops: [{ offset: 0, color: '#4FD1C5' }, { offset: 1, color: '#38B2AC' }] },
                  selectable: true, evented: true
              },
              {
                 type: 'textbox', left: 600, top: 1018, width: 180, fontSize: 18, fontFamily: 'Arial', fontWeight: 'bold', fill: '#FFFFFF', text: 'DETAILS', textAlign: 'center', selectable: true, evented: true,
              }
            ],
          }),
          preview: null, isDefault: false, createdAt: now, updatedAt: now,
        });

        // 5. НОВЫЙ МАКЕТ: "GLASSMORPHISM ABSTRACT" (Эффект матового стекла)
        layouts.push({
          name: 'Glassmorphism Abstract',
          description: 'Современный макет с эффектом матового стекла и ярким фоном',
          templateId: template.id,
          canvasData: JSON.stringify({
            version: '5.3.0',
            objects: [
              // Яркий сложный фон
              {
                type: 'rect', left: 0, top: 0, width: 900, height: 1200, fill: '#FFDEE9', selectable: false, evented: false,
              },
               // Декоративные градиентные пятна на фоне
              {
                 type: 'circle', left: 100, top: 200, radius: 250, fill: { type: 'radial', coords: { r1: 0, r2: 250, x1: 250, y1: 250, x2: 250, y2: 250 }, colorStops: [{ offset: 0, color: 'rgba(181, 123, 238, 0.6)' }, { offset: 1, color: 'rgba(181, 123, 238, 0)' }] }, selectable: false, evented: false,
              },
              {
                 type: 'circle', left: 500, top: 800, radius: 300, fill: { type: 'radial', coords: { r1: 0, r2: 300, x1: 300, y1: 300, x2: 300, y2: 300 }, colorStops: [{ offset: 0, color: 'rgba(109, 213, 237, 0.6)' }, { offset: 1, color: 'rgba(109, 213, 237, 0)' }] }, selectable: false, evented: false,
              },
              // Основная "стеклянная" карточка (Glassmorphism)
              // Используем полупрозрачный белый + обводку для имитации грани
              {
                type: 'rect', left: 50, top: 850, width: 800, height: 300, rx: 20, ry: 20,
                fill: 'rgba(255, 255, 255, 0.25)', // Полупрозрачная заливка
                stroke: 'rgba(255, 255, 255, 0.6)', // Светлая обводка грани
                strokeWidth: 2,
                selectable: false, evented: false,
              },
              // Заголовок на стекле
              {
                type: 'textbox', left: 100, top: 900, width: 700, fontSize: 48, fontFamily: 'Arial', fontWeight: 'bold', fill: '#333333', text: 'Абстрактный Дизайн', textAlign: 'left', selectable: true, evented: true,
              },
               // Текст на стекле
              {
                type: 'textbox', left: 100, top: 970, width: 700, fontSize: 24, fontFamily: 'Arial', fill: '#555555', text: 'Современный стиль с эффектом глубины и прозрачности.', textAlign: 'left', selectable: true, evented: true,
              },
               // Декоративный элемент "блик" на стекле
               {
                  type: 'rect', left: 70, top: 870, width: 760, height: 30, rx: 15, ry: 15, fill: 'rgba(255, 255, 255, 0.1)', selectable: false, evented: false
               }
            ],
          }),
          preview: null, isDefault: false, createdAt: now, updatedAt: now,
        });

         // 6. НОВЫЙ МАКЕТ: "VOLUMETRIC DARK MODE" (Объемный темный режим)
        layouts.push({
          name: 'Volumetric Dark Mode',
          description: 'Темный макет с неоновыми акцентами и имитацией свечения',
          templateId: template.id,
          canvasData: JSON.stringify({
            version: '5.3.0',
            objects: [
              // Глубокий темный фон
              {
                type: 'rect', left: 0, top: 0, width: 900, height: 1200, fill: '#0F172A', selectable: false, evented: false,
              },
              // Имитация объемного свечения (Radial Gradient) сзади
              {
                 type: 'circle', left: 200, top: 900, radius: 400, opacity: 0.4,
                 fill: { type: 'radial', coords: { r1: 0, r2: 400, x1: 400, y1: 400, x2: 400, y2: 400 }, colorStops: [{ offset: 0, color: '#6366F1' }, { offset: 1, color: 'transparent' }] },
                 selectable: false, evented: false,
              },
              // Плашка для контента с легким градиентом и обводкой
              {
                type: 'rect', left: 50, top: 800, width: 800, height: 350, rx: 24, ry: 24,
                fill: { type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 350 }, colorStops: [{ offset: 0, color: 'rgba(30, 41, 59, 0.8)' }, { offset: 1, color: 'rgba(15, 23, 42, 0.9)' }] },
                stroke: '#312E81', strokeWidth: 3,
                selectable: false, evented: false,
              },
              // Акцентная линия (неон)
              {
                type: 'rect', left: 100, top: 850, width: 100, height: 6, rx: 3, ry: 3, fill: '#818CF8', selectable: true, evented: true,
              },
               // Заголовок
              {
                type: 'textbox', left: 100, top: 880, width: 700, fontSize: 52, fontFamily: 'Arial', fontWeight: 'bold', fill: '#FFFFFF', text: 'NEON FUTURE', textAlign: 'left', selectable: true, evented: true,
              },
               // Описание
              {
                type: 'textbox', left: 100, top: 960, width: 700, fontSize: 22, fontFamily: 'Arial', fill: '#CBD5E1', text: 'Высокотехнологичный продукт с инновационным дизайном.', textAlign: 'left', selectable: true, evented: true,
              },
              // Блок характеристик (имитация объемных кнопок)
              {
                  type: 'rect', left: 100, top: 1040, width: 200, height: 60, rx: 12, ry: 12, fill: '#1E293B', stroke: '#4F46E5', strokeWidth: 2, selectable: true, evented: true
              },
              {
                 type: 'textbox', left: 100, top: 1058, width: 200, fontSize: 18, fontFamily: 'Arial', fontWeight: 'bold', fill: '#A5B4FC', text: 'TECH SPECS', textAlign: 'center', selectable: true, evented: true,
              }
            ],
          }),
          preview: null, isDefault: false, createdAt: now, updatedAt: now,
        });

      } else {
        // ==================================================================================
        // КАТЕГОРИЙНЫЕ МАКЕТЫ (ОСТАВЛЕНЫ БЕЗ ИЗМЕНЕНИЙ)
        // ==================================================================================
        if (template.name === 'Дом и интерьер') {
          // МАКЕТ ДЛЯ ЛАМПЫ
          layouts.push({
            name: 'Интерьерная лампа',
            description: 'Стильный макет для освещения и декора',
            templateId: template.id,
            canvasData: JSON.stringify({
              version: '5.3.0',
              objects: [
                // Светлый фон с градиентом
                {
                  type: 'rect', left: 0, top: 0, width: 900, height: 600, fill: '#F8F9FA', selectable: false, evented: false,
                },
                {
                  type: 'rect', left: 0, top: 600, width: 900, height: 600, fill: '#E9ECEF', selectable: false, evented: false,
                },
                // Декоративный круг (имитация света)
                {
                  type: 'circle', left: 250, top: 150, radius: 180, fill: 'rgba(255, 223, 186, 0.3)', selectable: false, evented: false,
                },
                {
                  type: 'circle', left: 300, top: 200, radius: 120, fill: 'rgba(255, 223, 186, 0.5)', selectable: false, evented: false,
                },
                // Изображение лампы
                {
                  type: 'image', left: 200, top: 250, width: 500, height: 500, src: '/uploads/lamp.png', selectable: true, evented: true,
                },
                // Бейдж "ДИЗАЙН"
                {
                  type: 'rect', left: 50, top: 50, width: 180, height: 60, fill: '#495057', rx: 30, ry: 30, selectable: true, evented: true,
                },
                {
                  type: 'textbox', left: 50, top: 65, width: 180, fontSize: 18, fontFamily: 'Arial', fontWeight: 'bold', fill: '#FFFFFF', text: 'ДИЗАЙН', textAlign: 'center', selectable: true, evented: true,
                },
                // Название
                {
                  type: 'textbox', left: 50, top: 850, width: 800, fontSize: 48, fontFamily: 'Georgia, serif', fontWeight: 'bold', fill: '#212529', text: 'НАСТОЛЬНАЯ ЛАМПА', textAlign: 'left', selectable: true, evented: true,
                },
                // Характеристики
                {
                  type: 'textbox', left: 50, top: 920, width: 800, fontSize: 20, fontFamily: 'Arial', fill: '#6C757D', text: '• Регулируемая яркость\n• Энергосберегающая LED\n• Современный скандинавский дизайн', textAlign: 'left', selectable: true, evented: true,
                },
                // Артикул
                {
                  type: 'textbox', left: 50, top: 1070, width: 400, fontSize: 24, fontFamily: 'Arial', fill: '#ADB5BD', text: 'Арт. LAMP-2026-001', textAlign: 'left', selectable: true, evented: true,
                },
              ],
            }),
            preview: null, isDefault: false, createdAt: now, updatedAt: now,
          });
        } else if (template.name === 'Косметика и уход') {
          // МАКЕТ ДЛЯ КРЕМА
          layouts.push({
            name: 'Крем для лица',
            description: 'Элегантный макет для косметики',
            templateId: template.id,
            canvasData: JSON.stringify({
              version: '5.3.0',
              objects: [
                // Нежный градиентный фон
                {
                  type: 'rect', left: 0, top: 0, width: 900, height: 600, fill: '#FFF5F7', selectable: false, evented: false,
                },
                {
                  type: 'rect', left: 0, top: 600, width: 900, height: 600, fill: '#FFE8EC', selectable: false, evented: false,
                },
                // Декоративные круги (мягкие)
                {
                  type: 'circle', left: 600, top: 100, radius: 150, fill: 'rgba(255, 192, 203, 0.2)', selectable: false, evented: false,
                },
                {
                  type: 'circle', left: 100, top: 900, radius: 120, fill: 'rgba(255, 192, 203, 0.15)', selectable: false, evented: false,
                },
                // Изображение крема
                {
                  type: 'image', left: 200, top: 250, width: 500, height: 500, src: '/uploads/cream.png', selectable: true, evented: true,
                },
                // Бейдж "УХОД"
                {
                  type: 'rect', left: 50, top: 50, width: 160, height: 55, fill: '#D4A5A5', rx: 27, ry: 27, selectable: true, evented: true,
                },
                {
                  type: 'textbox', left: 50, top: 64, width: 160, fontSize: 17, fontFamily: 'Arial', fontWeight: 'bold', fill: '#FFFFFF', text: 'УХОД', textAlign: 'center', selectable: true, evented: true,
                },
                // Название
                {
                  type: 'textbox', left: 50, top: 850, width: 800, fontSize: 46, fontFamily: 'Georgia, serif', fontWeight: 'bold', fill: '#8B4C5C', text: 'УВЛАЖНЯЮЩИЙ КРЕМ', textAlign: 'left', selectable: true, evented: true,
                },
                // Подзаголовок
                {
                  type: 'textbox', left: 50, top: 915, width: 800, fontSize: 22, fontFamily: 'Arial', fill: '#A67C8A', text: 'С гиалуроновой кислотой и витамином E', textAlign: 'left', selectable: true, evented: true,
                },
                // Преимущества
                {
                  type: 'textbox', left: 50, top: 970, width: 800, fontSize: 18, fontFamily: 'Arial', fill: '#B08B96', text: '✓ Глубокое увлажнение 24ч  ✓ Натуральный состав  ✓ Для всех типов кожи', textAlign: 'left', selectable: true, evented: true,
                },
                // Объем
                {
                  type: 'textbox', left: 50, top: 1070, width: 400, fontSize: 28, fontFamily: 'Arial', fontWeight: 'bold', fill: '#8B4C5C', text: '50 мл', textAlign: 'left', selectable: true, evented: true,
                },
              ],
            }),
            preview: null, isDefault: false, createdAt: now, updatedAt: now,
          });
        } else if (template.name === 'Одежда и обувь') {
          // МАКЕТ ДЛЯ КРОССОВОК
          layouts.push({
            name: 'Спортивные кроссовки',
            description: 'Динамичный макет для спортивной обуви',
            templateId: template.id,
            canvasData: JSON.stringify({
              version: '5.3.0',
              objects: [
                // Динамичный фон
                {
                  type: 'rect', left: 0, top: 0, width: 900, height: 1200, fill: '#F0F4F8', selectable: false, evented: false,
                },
                // Диагональные полосы (динамика)
                {
                  type: 'rect', left: -100, top: 100, width: 1100, height: 150, fill: '#3B82F6', angle: -10, opacity: 0.8, selectable: false, evented: false,
                },
                {
                  type: 'rect', left: -100, top: 300, width: 1100, height: 100, fill: '#60A5FA', angle: -10, opacity: 0.6, selectable: false, evented: false,
                },
                // Изображение кроссовок
                {
                  type: 'image', left: 150, top: 300, width: 600, height: 450, src: '/uploads/shoes.png', selectable: true, evented: true,
                },
                // Бейдж "SPORT"
                {
                  type: 'rect', left: 50, top: 50, width: 150, height: 55, fill: '#1E40AF', rx: 5, ry: 5, selectable: true, evented: true,
                },
                {
                  type: 'textbox', left: 50, top: 64, width: 150, fontSize: 20, fontFamily: 'Arial', fontWeight: 'bold', fill: '#FFFFFF', text: 'SPORT', textAlign: 'center', selectable: true, evented: true,
                },
                // Название модели
                {
                  type: 'textbox', left: 50, top: 820, width: 800, fontSize: 52, fontFamily: 'Impact, Arial', fill: '#1E293B', text: 'AIR RUNNER PRO', textAlign: 'left', selectable: true, evented: true,
                },
                // Технологии
                {
                  type: 'textbox', left: 50, top: 890, width: 800, fontSize: 20, fontFamily: 'Arial', fill: '#3B82F6', text: 'AIR CUSHION • BREATHABLE MESH • FLEX SOLE', textAlign: 'left', charSpacing: 100, selectable: true, evented: true,
                },
                // Характеристики в блоках
                {
                  type: 'rect', left: 50, top: 950, width: 180, height: 80, fill: '#FFFFFF', stroke: '#E2E8F0', strokeWidth: 2, rx: 10, ry: 10, selectable: true, evented: true,
                },
                {
                  type: 'textbox', left: 50, top: 960, width: 180, fontSize: 16, fontFamily: 'Arial', fill: '#64748B', text: 'ВЕС', textAlign: 'center', selectable: true, evented: true,
                },
                {
                  type: 'textbox', left: 50, top: 985, width: 180, fontSize: 24, fontFamily: 'Arial', fontWeight: 'bold', fill: '#1E293B', text: '280г', textAlign: 'center', selectable: true, evented: true,
                },
                {
                  type: 'rect', left: 250, top: 950, width: 180, height: 80, fill: '#FFFFFF', stroke: '#E2E8F0', strokeWidth: 2, rx: 10, ry: 10, selectable: true, evented: true,
                },
                {
                  type: 'textbox', left: 250, top: 960, width: 180, fontSize: 16, fontFamily: 'Arial', fill: '#64748B', text: 'РАЗМЕРЫ', textAlign: 'center', selectable: true, evented: true,
                },
                {
                  type: 'textbox', left: 250, top: 985, width: 180, fontSize: 24, fontFamily: 'Arial', fontWeight: 'bold', fill: '#1E293B', text: '36-45', textAlign: 'center', selectable: true, evented: true,
                },
                {
                  type: 'rect', left: 450, top: 950, width: 180, height: 80, fill: '#FFFFFF', stroke: '#E2E8F0', strokeWidth: 2, rx: 10, ry: 10, selectable: true, evented: true,
                },
                {
                  type: 'textbox', left: 450, top: 960, width: 180, fontSize: 16, fontFamily: 'Arial', fill: '#64748B', text: 'МАТЕРИАЛ', textAlign: 'center', selectable: true, evented: true,
                },
                {
                  type: 'textbox', left: 450, top: 985, width: 180, fontSize: 24, fontFamily: 'Arial', fontWeight: 'bold', fill: '#1E293B', text: 'MESH', textAlign: 'center', selectable: true, evented: true,
                },
              ],
            }),
            preview: null, isDefault: false, createdAt: now, updatedAt: now,
          });
        } else {
          // Для остальных категорий - базовый макет
          layouts.push({
            name: `${template.name} — базовый макет`,
            description: `Базовый макет для категории "${template.name}"`,
            templateId: template.id,
            canvasData: JSON.stringify({
              version: '5.3.0',
              objects: [
                {
                  type: 'rect', left: 0, top: 0, width: 900, height: 1200, fill: '#ffffff', selectable: false, evented: false,
                },
                {
                  type: 'textbox', left: 50, top: 80, width: 800, fontSize: 56, fontFamily: 'Arial', fontWeight: 'bold', fill: '#000000', text: template.name, textAlign: 'center', selectable: true, evented: true,
                },
                {
                  type: 'textbox', left: 50, top: 950, width: 800, fontSize: 48, fontFamily: 'Arial', fill: '#333333', text: 'Название товара', textAlign: 'center', selectable: true, evented: true,
                },
              ],
            }),
            preview: null, isDefault: false, createdAt: now, updatedAt: now,
          });
        }
      }
    });

    console.log(
      `[Seeder] Creating ${layouts.length} layouts for ${templates.length} templates`,
    );
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