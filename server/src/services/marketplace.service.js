const { Marketplace } = require('../../db/models');

class MarketplaceService {
  static async getAllMarketplaces() {
    return Marketplace.findAll({
      order: [['name', 'ASC']]
    });
  }

  static async getMarketplaceById(id) {
    return Marketplace.findByPk(id);
  }

  static async getMarketplaceBySlug(slug) {
    return Marketplace.findOne({ where: { slug } });
  }
}

module.exports = MarketplaceService;
