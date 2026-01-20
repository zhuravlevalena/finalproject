const LayoutService = require('../services/layout.service');

class LayoutController {
  static async getLayoutsByTemplateId(req, res) {
    try {
      const { templateId } = req.params;
      const layouts = await LayoutService.getLayoutsByTemplateId(templateId);
      return res.json(layouts);
    } catch (error) {
      console.error('Error getting layouts:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async getLayoutById(req, res) {
    try {
      const { id } = req.params;
      const layout = await LayoutService.getLayoutById(id);

      if (!layout) {
        return res.status(404).json({ error: 'Layout not found' });
      }

      return res.json(layout);
    } catch (error) {
      console.error('Error getting layout:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async createLayout(req, res) {
    try {
      const layout = await LayoutService.createLayout(req.body);
      return res.status(201).json(layout);
    } catch (error) {
      console.error('Error creating layout:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateLayout(req, res) {
    try {
      const { id } = req.params;
      const layout = await LayoutService.updateLayout(id, req.body);
      return res.json(layout);
    } catch (error) {
      console.error('Error updating layout:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async deleteLayout(req, res) {
    try {
      const { id } = req.params;
      await LayoutService.deleteLayout(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting layout:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = LayoutController;
