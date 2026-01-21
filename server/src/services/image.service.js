const { Image } = require('../../db/models');
const path = require('path');
const fs = require('fs').promises;

class ImageService {
  static async createImage(data) {
    return Image.create(data);
  }

  static async getImageById(id, userId) {
    return Image.findOne({
      where: { id, userId },
    });
  }

  static async getAllImages(userId) {
    return Image.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  static async deleteImage(id, userId) {
    const image = await Image.findOne({ where: { id, userId } });
    if (!image) {
      return null;
    }

    // Удаляем файл с диска
    try {
      const imageUrl = image.url;
      if (imageUrl) {
        // Определяем путь к файлу в зависимости от URL
        let filepath;
        if (imageUrl.startsWith('/img/')) {
          // Файл в папке img
          const filename = path.basename(imageUrl);
          filepath = path.join(__dirname, '../img', filename);
        } else if (imageUrl.startsWith('/uploads/')) {
          // Файл в папке uploads
          const filename = path.basename(imageUrl);
          filepath = path.join(__dirname, '../../uploads', filename);
        }

        if (filepath) {
          try {
            await fs.access(filepath);
            await fs.unlink(filepath);
            console.log('Файл удален с диска:', filepath);
          } catch (fileError) {
            // Файл не найден - это нормально, возможно уже удален
            console.warn('Файл не найден при удалении:', filepath);
          }
        }
      }
    } catch (fileError) {
      console.error('Ошибка при удалении файла:', fileError);
      // Продолжаем удаление записи из БД даже если файл не удалился
    }

    // Удаляем запись из БД
    await image.destroy();
    return true;
  }

  /**
   * Загружает изображение из multer file (memory storage) на диск и создает запись в БД
   * @param {Object} file - multer file object (содержит buffer, originalname, mimetype)
   * @param {number} userId - ID пользователя
   * @returns {Promise<Image>} - созданная запись изображения
   */
  static async uploadImage(file, userId) {
    if (!file) {
      throw new Error('No file provided');
    }

    // Проверяем, есть ли buffer (memory storage) или path (disk storage)
    if (!file.buffer && !file.path) {
      throw new Error('File must have either buffer or path');
    }

    // Создаем директорию uploads если её нет
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    let filename;
    let filepath;

    // Если файл уже на диске (disk storage)
    if (file.path) {
      filename = path.basename(file.path);
      filepath = file.path;
    } else {
      // Если файл в памяти (memory storage) - сохраняем на диск
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = file.originalname
        ? path.extname(file.originalname)
        : file.mimetype?.includes('png')
        ? '.png'
        : '.jpg';
      filename = uniqueSuffix + ext;
      filepath = path.join(uploadDir, filename);

      // Сохраняем файл на диск
      await fs.writeFile(filepath, file.buffer);
    }

    // Создаем запись в БД
    const imageUrl = `/uploads/${filename}`;
    const image = await Image.create({
      userId,
      url: imageUrl,
      type: 'generated', // Для карточек это generated изображение
      originalName: file.originalname || filename,
    });

    return image;
  }
}

module.exports = ImageService;
