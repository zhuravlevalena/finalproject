const TemplateService = require('../services/template.service');

class TemplateController {
  static async getAllTemplates(req, res) {
    try {
      const { marketplaceId } = req.query;
      const templates = await TemplateService.getAllTemplates(marketplaceId);
      return res.json(templates);
    } catch (error) {
      console.error('Error getting templates:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async getTemplateById(req, res) {
    try {
      const { id } = req.params;
      const template = await TemplateService.getTemplateById(id);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      return res.json(template);
    } catch (error) {
      console.error('Error getting template:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TemplateController;
