const { Template, Marketplace, Layout } = require('../../db/models');

class TemplateService {
  static async getAllTemplates(marketplaceId = null) {
    const where = marketplaceId ? { marketplaceId } : {};
    return Template.findAll({
      where,
      include: [
        { model: Marketplace, as: 'marketplace' },
        { model: Layout, as: 'layouts' },
      ],
      order: [
        ['isDefault', 'DESC'],
        ['name', 'ASC'],
      ],
    });
  }

  static async getTemplateById(id) {
    return Template.findByPk(id, {
      include: [
        { model: Marketplace, as: 'marketplace' },
        { model: Layout, as: 'layouts' },
      ],
    });
  }
}

module.exports = TemplateService;
