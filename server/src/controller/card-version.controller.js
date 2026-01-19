const CardVersionService = require('../services/card-version.service');

class CardVersionController {
  // Получить все версии карточки
  static async getVersions(req, res) {
    try {
      const { cardId } = req.params;
      const userId = req.user.id;
      
      const versions = await CardVersionService.getVersions(cardId, userId);
      return res.json(versions);
    } catch (error) {
      console.error('Error getting versions:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Получить конкретную версию
  static async getVersion(req, res) {
    try {
      const { versionId } = req.params;
      const userId = req.user.id;
      
      const version = await CardVersionService.getVersionById(versionId, userId);
      return res.json(version);
    } catch (error) {
      console.error('Error getting version:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Создать новую версию
  static async createVersion(req, res) {
    try {
      const { cardId } = req.params;
      const userId = req.user.id;
      const data = req.body;
      
      const version = await CardVersionService.createVersion(cardId, data, userId);
      return res.status(201).json(version);
    } catch (error) {
      console.error('Error creating version:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Восстановить версию
  static async restoreVersion(req, res) {
    try {
      const { versionId } = req.params;
      const userId = req.user.id;
      
      const newVersion = await CardVersionService.restoreVersion(versionId, userId);
      return res.json(newVersion);
    } catch (error) {
      console.error('Error restoring version:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Сравнить версии
  static async compareVersions(req, res) {
    try {
      const { versionId1, versionId2 } = req.query;
      const userId = req.user.id;
      
      if (!versionId1 || !versionId2) {
        return res.status(400).json({ error: 'Both version IDs are required' });
      }
      
      const comparison = await CardVersionService.compareVersions(
        versionId1, 
        versionId2, 
        userId
      );
      return res.json(comparison);
    } catch (error) {
      console.error('Error comparing versions:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Автосохранение
  static async autoSave(req, res) {
    try {
      const { cardId } = req.params;
      const userId = req.user.id;
      const { canvasData } = req.body;
      
      const version = await CardVersionService.autoSave(cardId, canvasData, userId);
      return res.json({ success: true, version });
    } catch (error) {
      console.error('Error auto-saving:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CardVersionController;
