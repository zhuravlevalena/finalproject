const { Image } = require('../../db/models');

class ImageService {
  static async createImage(data) {
    return Image.create(data);
  }

  static async getImageById(id, userId) {
    return Image.findOne({
      where: { id, userId }
    });
  }

  static async getAllImages(userId) {
    return Image.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  }

  static async deleteImage(id, userId) {
    const image = await Image.findOne({ where: { id, userId } });
    if (!image) {
      return null;
    }
    await image.destroy();
    return true;
  }
}

module.exports = ImageService;
