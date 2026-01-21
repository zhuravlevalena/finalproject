require('dotenv').config();
const { GigaChat, detectImage } = require('gigachat');
const fs = require('fs').promises;
const path = require('path');
const ImageService = require('./image.service');

class AiService {
  constructor() {
    this.client = new GigaChat({
      model: 'GigaChat-Pro',
      credentials: process.env.GIGACHAT_KEY,
       timeout:600,
    });
  }

  async ask(question) {
    const response = await this.client.chat({
      messages: [{ role: 'user', content: question }],
       function_call: 'auto',
     
    });

    const content = response.choices?.[0]?.message?.content ?? '';
    console.log('AI content:', content);

    const detectedImage = detectImage(content);
    if (!detectedImage) {
      // Нет изображения в ответе — вернём текст
      return { type: 'text', content };
    }

    const image = await this.client.getImage(detectedImage.uuid);
    console.log('Image meta:', image);

    return { type: 'image', image };
  }

  /**
   * Генерирует изображение и сохраняет его в папку img и в БД
   * @param {string} prompt - Описание для генерации изображения
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} - Объект изображения из БД с полями id, url, userId и т.д.
   */
  async createImg(prompt, userId) {
    try {
      // Генерируем изображение через ask()
      const result = await this.ask(prompt);

      // Если получили текст вместо изображения
      if (result.type === 'text') {
        throw new Error(result.content || 'Не удалось сгенерировать изображение. AI вернул текстовый ответ.');
      }

      // Получаем изображение
      const imageData = result.image;
      
      // Проверяем наличие данных изображения
      if (!imageData) {
        throw new Error('Изображение не получено от AI');
      }

      // Создаем директорию img если её нет
      // Нужно сохранять в server/src/img (а не в server/src/services/img)
      const imgDir = path.join(__dirname, '../img');
      try {
        await fs.access(imgDir);
      } catch {
        await fs.mkdir(imgDir, { recursive: true });
      }

      // Генерируем уникальное имя файла
      const timestamp = Date.now();
      const uuid = imageData.uuid || Math.random().toString(36).substring(2, 15);
      // Если content похож на JPEG (JFIF/FF D8) — сохраняем как .jpg
      const ext =
        typeof imageData?.content === 'string' &&
        (imageData.content.startsWith('ÿØÿ') || imageData.content.includes('JFIF'))
          ? '.jpg'
          : '.png';

      const filename = `ai-${timestamp}-${uuid}-1${ext}`;
      const filepath = path.join(imgDir, filename);

      // Сохраняем изображение
      // imageData может быть Buffer или объектом с buffer/data/base64
      let imageBuffer;
      if (Buffer.isBuffer(imageData)) {
        imageBuffer = imageData;
      } else if (Buffer.isBuffer(imageData.content)) {
        imageBuffer = imageData.content;
      } else if (typeof imageData.content === 'string') {
        // gigachat возвращает content как бинарную строку (latin1)
        imageBuffer = Buffer.from(imageData.content, 'latin1');
      } else if (imageData.buffer) {
        imageBuffer = Buffer.isBuffer(imageData.buffer) 
          ? imageData.buffer 
          : Buffer.from(imageData.buffer);
      } else if (imageData.data) {
        imageBuffer = Buffer.isBuffer(imageData.data)
          ? imageData.data
          : Buffer.from(imageData.data);
      } else if (imageData.base64) {
        const base64Data = imageData.base64.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else if (typeof imageData === 'string') {
        // Пробуем получить как строку base64
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        throw new Error('Не удалось определить формат данных изображения');
      }

      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error('Буфер изображения пуст');
      }

      await fs.writeFile(filepath, imageBuffer);

      // Возвращаем путь для доступа через веб-сервер
      const imageUrl = `/img/${filename}`;
      console.log('Изображение сохранено:', imageUrl, 'Размер:', imageBuffer.length, 'байт');
      
      // Сохраняем в БД
      const image = await ImageService.createImage({
        userId,
        url: imageUrl,
        type: 'generated',
        prompt: prompt,
        originalName: filename,
        metadata: {
          uuid: imageData.uuid || uuid,
          timestamp: timestamp,
        }
      });

      console.log('Изображение сохранено в БД с ID:', image.id);
      
      return image;
    } catch (error) {
      console.error('Ошибка при создании изображения:', error);
      throw error;
    }
  }
}

// Тест только при прямом запуске файла
if (require.main === module) {
  const aiService = new AiService();
  aiService
    .ask('сгенерируй большого пса')
    .then((result) => console.log('Result:', result))
    .catch((err) => console.error('Ошибка:', err));
}

module.exports = new AiService();
