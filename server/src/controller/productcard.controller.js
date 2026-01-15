const ProductCardService = require('../services/productcard.service');

class ProductCardController {
  static async getAllCards(req, res) {
    try {
      const userId = req.user.id;
      const cards = await ProductCardService.getAllCards(userId);
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
      const data = { ...req.body, userId };
      const card = await ProductCardService.createCard(data);
      return res.status(201).json(card);
    } catch (error) {
      console.error('Error creating card:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateCard(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const data = req.body;
      
      const card = await ProductCardService.updateCard(id, userId, data);
      
      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }
      
      return res.json(card);
    } catch (error) {
      console.error('Error updating card:', error);
      return res.status(500).json({ error: error.message });
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
