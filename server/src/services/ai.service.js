require('dotenv').config();
const { default: GigaChat, detectImage } = require('gigachat');
const { Agent } = require('node:https');

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

class AiService {
  constructor() {
    this.client = new GigaChat({
      model: 'Gigachat-Pro',
      credentials: process.env.GIGACHAT_KEY,
      timeout: 60000,
      httpsAgent: httpsAgent,
    });
  }

  async ask(question) {
    try {
      const response = await this.client.chat({
        messages: [{ role: 'user', content: question }],
      });
      return response.choices[0]?.message?.content || response.choices[0]?.content;
    } catch (error) {
      console.error('Error in ask method:', error);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
  }

  async generateMarketCard(prompt) {
    try {
      // Генерируем изображение через GigaChat
      const fullPrompt = `Сгенерируй изображение: ${prompt}`;
      
      console.log('Sending request to GigaChat with prompt:', fullPrompt);
      
      const response = await this.client.chat({
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
      });

      console.log('GigaChat response structure:', JSON.stringify({
        hasChoices: !!response.choices,
        choicesLength: response.choices?.length,
        firstChoice: response.choices?.[0] ? {
          hasMessage: !!response.choices[0].message,
          messageContent: typeof response.choices[0].message?.content,
          hasContent: !!response.choices[0].content,
          contentType: typeof response.choices[0].content,
        } : null,
      }, null, 2));

      const responseContent = response.choices[0]?.message?.content || response.choices[0]?.content;
      
      if (!responseContent) {
        console.error('Empty response from GigaChat. Full response:', JSON.stringify(response, null, 2));
        throw new Error('Empty response from GigaChat');
      }

      console.log('Response content type:', typeof responseContent);
      console.log('Response content preview:', typeof responseContent === 'string' 
        ? responseContent.substring(0, 200) 
        : 'Not a string');

      // Извлекаем информацию об изображении из ответа
      let detectedImage;
      try {
        detectedImage = detectImage(responseContent);
        console.log('Detected image:', detectedImage ? {
          hasUuid: !!detectedImage.uuid,
          uuid: detectedImage.uuid,
          keys: Object.keys(detectedImage),
        } : 'null');
      } catch (detectError) {
        console.error('Error in detectImage:', detectError);
        console.error('Response content that failed detection:', 
          typeof responseContent === 'string' ? responseContent.substring(0, 500) : responseContent);
        throw new Error(`Failed to detect image in response: ${detectError.message}`);
      }
      
      if (!detectedImage || !detectedImage.uuid) {
        console.error('No image UUID detected. DetectedImage object:', detectedImage);
        console.error('Full response content:', typeof responseContent === 'string' 
          ? responseContent 
          : JSON.stringify(responseContent, null, 2));
        throw new Error('No image detected in response. GigaChat may not support image generation in this format, or the response format is different.');
      }

      // Получаем само изображение
      console.log('Fetching image with UUID:', detectedImage.uuid);
      const image = await this.client.getImage(detectedImage.uuid);
      
      if (!image || !image.content) {
        console.error('Image object received:', image ? {
          hasContent: !!image.content,
          contentType: typeof image.content,
          mimeType: image.mimeType,
          keys: Object.keys(image),
        } : 'null');
        throw new Error('Failed to get image content');
      }

      console.log('Image received successfully. MimeType:', image.mimeType, 'Content length:', 
        typeof image.content === 'string' ? image.content.length : 'not a string');

      // Преобразуем byte string в Buffer для работы с файлами
      let imageBuffer;
      if (typeof image.content === 'string') {
        imageBuffer = Buffer.from(
          Array.from(image.content).map(letter => letter.charCodeAt(0))
        );
      } else if (Buffer.isBuffer(image.content)) {
        imageBuffer = image.content;
      } else if (image.content instanceof Uint8Array) {
        imageBuffer = Buffer.from(image.content);
      } else {
        console.error('Unknown image content type:', typeof image.content);
        throw new Error('Unknown image content format');
      }

      console.log('Image buffer created. Size:', imageBuffer.length, 'bytes');

      return {
        buffer: imageBuffer,
        uuid: detectedImage.uuid,
        mimeType: image.mimeType || 'image/png',
      };
    } catch (error) {
      console.error('Error in generateMarketCard method:', error);
      console.error('Error stack:', error.stack);
      throw new Error(`Failed to generate market card: ${error.message}`);
    }
  }
}

module.exports = new AiService();
