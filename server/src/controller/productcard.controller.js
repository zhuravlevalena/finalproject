const ProductCardService = require('../services/productcard.service');
const ImageService = require('../services/image.service');
const multer = require('multer');

// Настройка multer для загрузки изображений
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

class ProductCardController {
  static async getAllCards(req, res) {
    try {
      const userId = req.user.id;
      const filters = {
        search: req.query.search,
        marketplaceId: req.query.marketplaceId ? Number(req.query.marketplaceId) : undefined,
        status: req.query.status,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'DESC'
      };
      
      const cards = await ProductCardService.getAllCards(userId, filters);
      return res.json(cards);
    } catch (error) {
      console.error('Error getting cards:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async getCardById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const card = await ProductCardService.getCardById(id, userId);

      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      return res.json(card);
    } catch (error) {
      console.error('Error getting card:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async createCard(req, res) {
    try {
      const userId = req.user.id;
      let generatedImageId = null;

      // Если есть загруженное изображение, сохраняем его
      if (req.file) {
        const image = await ImageService.uploadImage(req.file, userId);
        generatedImageId = image.id;
      }

      // Парсим canvasData если он есть
      let canvasData = null;
      if (req.body.canvasData) {
        try {
          canvasData =
            typeof req.body.canvasData === 'string'
              ? JSON.parse(req.body.canvasData)
              : req.body.canvasData;
        } catch (err) {
          console.error('Error parsing canvasData:', err);
        }
      }
      const cardData = {
        userId,
        marketplaceId: req.body.marketplaceId ? parseInt(req.body.marketplaceId) : null,
        templateId: req.body.templateId ? parseInt(req.body.templateId) : null,
        productProfileId: req.body.productProfileId
          ? parseInt(req.body.productProfileId)
          : null,
        title: req.body.title || null,
        description: req.body.description || null,
        imageId: req.body.imageId ? parseInt(req.body.imageId) : null,
        generatedImageId,
        canvasData: canvasData || null, // Сохраняем только минимальные метаданные
        status: req.body.status || 'completed',
      };

      const card = await ProductCardService.createCard(cardData);
      // Загружаем карточку с включенными связями для возврата клиенту
      const cardWithRelations = await ProductCardService.getCardById(card.id, userId);
      res.status(201).json(cardWithRelations);
    } catch (error) {
      console.error('Error creating card:', error);
      res.status(500).json({ error: 'Failed to create card' });
    }
  }

  static async updateCard(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      let generatedImageId = null;

      // Если есть загруженное изображение, сохраняем его
      if (req.file) {
        const image = await ImageService.uploadImage(req.file, userId);
        generatedImageId = image.id;
      }

      // Парсим canvasData если он есть
      let canvasData = null;
      if (req.body.canvasData) {
        try {
          canvasData =
            typeof req.body.canvasData === 'string'
              ? JSON.parse(req.body.canvasData)
              : req.body.canvasData;
        } catch (err) {
          console.error('Error parsing canvasData:', err);
        }
      }
      const updateData = {
        ...(req.body.marketplaceId && {
          marketplaceId: parseInt(req.body.marketplaceId),
        }),
        ...(req.body.templateId && { templateId: parseInt(req.body.templateId) }),
        ...(req.body.productProfileId && {
          productProfileId: parseInt(req.body.productProfileId),
        }),
        ...(req.body.title && { title: req.body.title }),
        ...(req.body.description && { description: req.body.description }),
        ...(req.body.imageId && { imageId: parseInt(req.body.imageId) }),
        ...(generatedImageId && { generatedImageId }),
        ...(canvasData && { canvasData }),
        ...(req.body.status && { status: req.body.status }),
      };

      const card = await ProductCardService.updateCard(id, userId, updateData);

      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      // Загружаем карточку с включенными связями для возврата клиенту
      const cardWithRelations = await ProductCardService.getCardById(id, userId);
      res.json(cardWithRelations);
    } catch (error) {
      console.error('Error updating card:', error);
      res.status(500).json({ error: 'Failed to update card' });
    }
  }

  static async deleteCard(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const deleted = await ProductCardService.deleteCard(id, userId);

      if (!deleted) {
        return res.status(404).json({ error: 'Card not found' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting card:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProductCardController;
