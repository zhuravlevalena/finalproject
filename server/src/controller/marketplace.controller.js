const MarketplaceService = require('../services/marketplace.service');

class MarketplaceController {
  static async getAllMarketplaces(req, res) {
    try {
      const marketplaces = await MarketplaceService.getAllMarketplaces();
      return res.json(marketplaces);
    } catch (error) {
      console.error('Error getting marketplaces:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async getMarketplaceById(req, res) {
    try {
      const { id } = req.params;
      const marketplace = await MarketplaceService.getMarketplaceById(id);
      
      if (!marketplace) {
        return res.status(404).json({ error: 'Marketplace not found' });
      }
      
      return res.json(marketplace);
    } catch (error) {
      console.error('Error getting marketplace:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = MarketplaceController;
