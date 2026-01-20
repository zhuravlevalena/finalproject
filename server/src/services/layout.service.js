const { Layout, Template, Marketplace } = require('../../db/models');

class LayoutService {
  static async getLayoutsByTemplateId(templateId) {
    return Layout.findAll({
      where: { templateId },
      include: [
        {
          model: Template,
          as: 'template',
          include: [{ model: Marketplace, as: 'marketplace' }],
        },
      ],
      order: [
        ['isDefault', 'DESC'],
        ['name', 'ASC'],
      ],
    });
  }

  static async getLayoutById(id) {
    return Layout.findByPk(id, {
      include: [
        {
          model: Template,
          as: 'template',
          include: [{ model: Marketplace, as: 'marketplace' }],
        },
      ],
    });
  }

  static async createLayout(data) {
    return Layout.create(data);
  }

  static async updateLayout(id, data) {
    const layout = await Layout.findByPk(id);
    if (!layout) {
      throw new Error('Layout not found');
    }
    return layout.update(data);
  }

  static async deleteLayout(id) {
    const layout = await Layout.findByPk(id);
    if (!layout) {
      throw new Error('Layout not found');
    }
    return layout.destroy();
  }
}

module.exports = LayoutService;
