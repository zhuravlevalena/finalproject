const { OpenAI } = require('openai');
const path = require('path');
const fs = require('fs').promises;
const { randomUUID } = require('crypto');
require('dotenv').config();

const IMAGES_DIR = path.join(__dirname, '../img');

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPEN_API_KEY,
});

// Функция для сохранения base64 картинки в файл
async function saveImageFromBase64(base64DataUrl, filename) {
  // Создаем папку img если её нет
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  
  // Извлекаем base64 часть из data URL (формат: data:image/png;base64,iVBORw0KG...)
  const base64Match = base64DataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!base64Match) {
    throw new Error('Неверный формат base64 data URL');
  }
  
  const [, imageType, base64Data] = base64Match;
  const buffer = Buffer.from(base64Data, 'base64');
  const filepath = path.join(IMAGES_DIR, filename);
  
  await fs.writeFile(filepath, buffer);
  return filepath;
}

async function createImg(query){
const apiResponse = await client.chat.completions.create({
  model: 'black-forest-labs/flux.2-klein-4b',
  messages: [
    {
      role: 'user',
      content: query || 'Generate a beautiful sunset over mountains',
    },
  ],
  modalities: ['image', 'text']
});

const response = apiResponse.choices[0].message;
if (response.images) {
  // Используем for...of вместо forEach для правильной работы с async
  for (let index = 0; index < response.images.length; index++) {
    const image = response.images[index];
    const imageUrl = image.image_url.url; // Base64 data URL
    console.log(`Generated image ${index + 1}: ${imageUrl.substring(0, 50)}...`);
    
    // Сохраняем картинку в папку img
    const filename = `ai-${Date.now()}-${randomUUID()}-${index + 1}.png`;
    try {
      const savedPath = await saveImageFromBase64(imageUrl, filename);
      console.log(`✓ Картинка сохранена: ${savedPath}`);
    } catch (error) {
      console.error(`✗ Ошибка при сохранении картинки ${index + 1}:`, error.message);
    }
  }
}
}

// Экспорт для использования из контроллера (/api/ai/ask)
module.exports = {
  createImg,
};

// Запуск при прямом вызове файла (node src/services/ai.service.js "твой промпт")
if (require.main === module) {
  const prompt = process.argv.slice(2).join(' ').trim() || 'Гора Фудзи';
  createImg(prompt).catch((error) => {
    console.error('Ошибка:', error);
    process.exitCode = 1;
  });
}