const { GoogleGenAI } = require('@google/genai')
require('dotenv').config()


class AiService {
    constructor(){
        this.ai = new GoogleGenAI({
            apiKey:process.env.GEMINI_API_KEY
        })
    }



static async createImg(prompt){
    try {
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        })
        
        const response = await ai.models.generateContent({
            model:'gemini-2.0-flash',
            contents: prompt || "Создай изображение зубной щетки в стакане на желтом фоне"
        })
        
        let result = '';
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                result += part.text;
            } 
        }
        
        return result;
    } catch (error) {
        console.error('Error in createImg:', error);
        throw new Error(`Failed to generate content: ${error.message}`);
    }
}
}

module.exports = AiService;