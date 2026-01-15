const { ProductProfile, User } = require('../../db/models');

class ProductProfileService {
  static async getAllProfiles(userId) {
    return ProductProfile.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  }

  static async getProfileById(id, userId) {
    return ProductProfile.findOne({
      where: { id, userId }
    });
  }

  static async getOrCreateProfile(userId, productType) {
    let profile = await ProductProfile.findOne({
      where: { userId, productType }
    });

    if (!profile) {
      profile = await ProductProfile.create({
        userId,
        productType
      });
    }

    return profile;
  }

  static async updateProfile(id, userId, data) {
    const profile = await ProductProfile.findOne({ where: { id, userId } });
    if (!profile) {
      return null;
    }
    return profile.update(data);
  }

  static async deleteProfile(id, userId) {
    const profile = await ProductProfile.findOne({ where: { id, userId } });
    if (!profile) {
      return null;
    }
    await profile.destroy();
    return true;
  }
}

module.exports = ProductProfileService;
