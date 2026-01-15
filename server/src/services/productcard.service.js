const { ProductCard, User, Marketplace, Template, ProductProfile, Image } = require('../../db/models');

class ProductCardService {
  static async getAllCards(userId) {
    return ProductCard.findAll({
      where: { userId },
      include: [
        { model: Marketplace, as: 'marketplace' },
        { model: Template, as: 'template' },
        { model: ProductProfile, as: 'productProfile' },
        { model: Image, as: 'image' },
        { model: Image, as: 'generatedImage' }
      ],
      order: [['createdAt', 'DESC']]
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
    return card.update(data);
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
