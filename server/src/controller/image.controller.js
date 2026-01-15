const ImageService = require('../services/image.service');
const aiService = require('../services/ai.service');
const path = require('path');
const fs = require('fs').promises;

class ImageController {
  static async uploadImage(req, res) {
    try {
      const userId = req.user.id;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      
      const image = await ImageService.createImage({
        userId,
        url: imageUrl,
        type: 'uploaded',
        originalName: req.file.originalname
      });

      return res.status(201).json(image);
    } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async getAllImages(req, res) {
    try {
      const userId = req.user.id;
      const images = await ImageService.getAllImages(userId);
      return res.json(images);
    } catch (error) {
      console.error('Error getting images:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async getImageById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const image = await ImageService.getImageById(id, userId);
      
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      return res.json(image);
    } catch (error) {
      console.error('Error getting image:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async deleteImage(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const deleted = await ImageService.deleteImage(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting image:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async generateImage(req, res) {
    try {
      const userId = req.user.id;
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // Генерируем изображение через AI
      const generatedImage = await aiService.generateMarketCard(prompt);

      // Сохраняем изображение в папку uploads
      const uploadDir = path.join(__dirname, '../../uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const filename = `generated-${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
      const filepath = path.join(uploadDir, filename);
      
      await fs.writeFile(filepath, generatedImage.buffer);

      const imageUrl = `/uploads/${filename}`;

      // Создаем запись в БД
      const image = await ImageService.createImage({
        userId,
        url: imageUrl,
        type: 'generated',
        prompt: prompt,
        originalName: `generated-${filename}`,
        metadata: {
          uuid: generatedImage.uuid,
          mimeType: generatedImage.mimeType,
        }
      });

      return res.status(201).json(image);
    } catch (error) {
      console.error('Error generating image:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ImageController;
