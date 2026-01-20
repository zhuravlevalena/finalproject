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
            res.status(500).json({ error: error.message || 'Failed to generate content' });
        }
    }
}

module.exports = AiController