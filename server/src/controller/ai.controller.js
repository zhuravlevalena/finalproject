const aiService = require('../services/ai.service');

class AiController {
  static async ask(req, res) {
    try {
      const { query } = req.body;
      const userId = req.user.id;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required' });
      }

      const image = await aiService.createImg(query, userId);
      res.status(200).json({ response: image.url, image });
    } catch (error) {
      console.error('Error in AI controller:', error);

      // Обработка ошибки нехватки кредитов на OpenRouter
      if (error.status === 402 || error.code === 402) {
        return res.status(402).json({
          error:
            'Недостаточно кредитов на OpenRouter для генерации изображения. Пожалуйста, пополните баланс на https://openrouter.ai/settings/credits или используйте более простой запрос.',
        });
      }

      // Обработка других ошибок API
      // TLS/сертификаты
      if (error?.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
        return res.status(502).json({
          error:
            'TLS ошибка при запросе к AI (SELF_SIGNED_CERT_IN_CHAIN). Проверь сертификаты/прокси/корпоративный MITM.',
        });
      }

      // Остальные ошибки: статус только числовой
      const maybeStatus = error?.status ?? error?.response?.status;
      const status = typeof maybeStatus === 'number' ? maybeStatus : 500;

      return res.status(status).json({
        error: error?.message || 'Ошибка при генерации изображения',
      });
    }
    // res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
}

module.exports = AiController;
