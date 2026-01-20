require('dotenv').config();
const OpenAI = require('openai');

class AiService {
    constructor(){
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
        }
    }

    static async createImg(prompt){
        try {
            if (!process.env.OPENAI_API_KEY) {
                throw new Error('OPENAI_API_KEY is not set in environment variables');
            }

            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });

            const userPrompt = prompt || "Создай описание карточки товара для зубной щетки";
            
            // Используем ChatGPT для генерации текстового контента
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Ты помощник для создания описаний карточек товаров. Создавай подробные и привлекательные описания товаров на русском языке."
                    },
                    {
                        role: "user",
                        content: userPrompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7,
            });

            const text = completion.choices[0]?.message?.content;
            
            if (!text) {
                throw new Error('OpenAI вернул пустой ответ');
            }

            return text;
        } catch (error) {
            console.error('Error in createImg:', error);
            
            // Обработка специфичных ошибок
            const errorMessage = error.message || '';
            const errorString = JSON.stringify(error);
            
            // Проверка на недействительный API ключ
            if (errorMessage.includes('API key') || errorMessage.includes('Invalid API key') || errorString.includes('401')) {
                throw new Error('Неверный API ключ. Проверьте OPENAI_API_KEY в .env файле. Убедитесь, что ключ правильный и не содержит лишних пробелов или кавычек.');
            }
            
            if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorString.includes('429')) {
                throw new Error('Превышен лимит запросов к OpenAI API. Попробуйте позже или обновите тарифный план.');
            }
            
            if (errorMessage.includes('401') || errorString.includes('401')) {
                throw new Error('Ошибка авторизации. Проверьте OPENAI_API_KEY в .env файле.');
            }
            
            if (errorMessage.includes('insufficient_quota') || errorString.includes('insufficient_quota')) {
                throw new Error('Недостаточно средств на счету OpenAI. Пополните баланс.');
            }
            
            // Обработка ошибки недоступности в регионе
            if (errorMessage.includes('Country, region, or territory not supported') || 
                errorMessage.includes('unsupported_country_region_territory') ||
                errorString.includes('unsupported_country_region_territory') ||
                error.code === 'unsupported_country_region_territory') {
                throw new Error('OpenAI API недоступен в вашем регионе. Используйте VPN или альтернативный сервис (например, Google Gemini).');
            }
            
            // Обработка ошибки 403 (запрещено)
            if (error.status === 403 || errorString.includes('403')) {
                throw new Error('Доступ к OpenAI API запрещен. Возможно, сервис недоступен в вашем регионе или требуется настройка прокси.');
            }
            
            throw new Error(`Failed to generate content: ${errorMessage}`);
        }
    }
}

module.exports = AiService;
