const aiService = require('../services/ai.service')

class AiController{
    static async ask(req,res){
        try {
            const { query } = req.body;
            
            if (!query || typeof query !== 'string') {
                return res.status(400).json({ error: 'Query is required' });
            }
            
            const response = await aiService.createImg(query);
            res.status(200).json({ response });
        } catch (error) {
            console.error('Error in AI controller:', error);
            
            // Обработка ошибки нехватки кредитов на OpenRouter
            if (error.status === 402 || error.code === 402) {
                return res.status(402).json({ 
                    error: 'Недостаточно кредитов на OpenRouter для генерации изображения. Пожалуйста, пополните баланс на https://openrouter.ai/settings/credits или используйте более простой запрос.' 
                });
            }
            
            // Обработка других ошибок API
            if (error.status || error.code) {
                return res.status(error.status || error.code || 500).json({ 
                    error: error.message || 'Ошибка при генерации изображения' 
                });
            }
            
            res.status(500).json({ error: error.message || 'Failed to generate content' });
        }
    }
}

module.exports = AiController