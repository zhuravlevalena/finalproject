const ProductProfileService = require('../services/productprofile.service');

class ProductProfileController {
  static async getAllProfiles(req, res) {
    try {
      const userId = req.user.id;
      const profiles = await ProductProfileService.getAllProfiles(userId);
      return res.json(profiles);
    } catch (error) {
      console.error('Error getting profiles:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async getProfileById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const profile = await ProductProfileService.getProfileById(id, userId);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      return res.json(profile);
    } catch (error) {
      console.error('Error getting profile:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async getOrCreateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { productType } = req.body;
      const profile = await ProductProfileService.getOrCreateProfile(userId, productType);
      return res.json(profile);
    } catch (error) {
      console.error('Error getting/creating profile:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const data = req.body;
      
      const profile = await ProductProfileService.updateProfile(id, userId, data);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      return res.json(profile);
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async deleteProfile(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const deleted = await ProductProfileService.deleteProfile(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting profile:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProductProfileController;
