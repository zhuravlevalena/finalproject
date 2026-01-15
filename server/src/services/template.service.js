const { Template, Marketplace } = require('../../db/models');

class TemplateService {
  static async getAllTemplates(marketplaceId = null) {
    const where = marketplaceId ? { marketplaceId } : {};
    return Template.findAll({
      where,
      include: [
        { model: Marketplace, as: 'marketplace' }
      ],
      order: [['isDefault', 'DESC'], ['name', 'ASC']]
    });
  }

  static async getTemplateById(id) {
    return Template.findByPk(id, {
      include: [
        { model: Marketplace, as: 'marketplace' }
      ]
    });
  }
}

module.exports = TemplateService;
