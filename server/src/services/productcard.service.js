const { ProductCard, User, Marketplace, Template, ProductProfile, Image } = require('../../db/models');
const { Op } = require('sequelize');
const CardVersionService = require('./card-version.service');

class ProductCardService {
  static async getAllCards(userId, filters = {}) {
    const {
      search,
      marketplaceId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = filters;

    const where = { userId };

    // Поиск по названию или описанию
    if (search && search.trim()) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search.trim()}%` } },
        { description: { [Op.iLike]: `%${search.trim()}%` } }
      ];
    }

    // Фильтр по маркетплейсу
    if (marketplaceId) {
      where.marketplaceId = marketplaceId;
    }

    // Фильтр по статусу
    if (status) {
      where.status = status;
    }

    return ProductCard.findAll({
      where,
      include: [
        { model: Marketplace, as: 'marketplace' },
        { model: Template, as: 'template' },
        { model: ProductProfile, as: 'productProfile' },
        { model: Image, as: 'image' },
        { model: Image, as: 'generatedImage' }
      ],
      order: [[sortBy, sortOrder]]
    });
  }

  static async getCardById(id, userId) {
    return ProductCard.findOne({
      where: { id, userId },
      include: [
        { model: Marketplace, as: 'marketplace' },
        { model: Template, as: 'template' },
        { model: ProductProfile, as: 'productProfile' },
        { model: Image, as: 'image' },
        { model: Image, as: 'generatedImage' }
      ]
    });
  }

  static async createCard(data) {
    return ProductCard.create(data);
  }

  static async updateCard(id, userId, data) {
    const card = await ProductCard.findOne({ where: { id, userId } });
    if (!card) {
      return null;
    }

    // Сохраняем старые данные для сравнения
    const oldCanvasData = card.canvasData;

    // Обновляем карточку
    const updatedCard = await card.update(data);

    // Создаем версию, если canvasData изменился
    if (data.canvasData && 
        JSON.stringify(oldCanvasData) !== JSON.stringify(data.canvasData)) {
      try {
        await CardVersionService.createVersion(id, {
          canvasData: data.canvasData,
          title: data.title,
          description: data.description,
          changeDescription: 'Ручное сохранение',
        }, userId);
      } catch (error) {
        // Логируем ошибку, но не прерываем обновление карточки
        console.error('Error creating version:', error);
      }
    }

    return updatedCard;
  }

  static async deleteCard(id, userId) {
    const card = await ProductCard.findOne({ where: { id, userId } });
    if (!card) {
      return null;
    }
    await card.destroy();
    return true;
  }
}

module.exports = ProductCardService;
