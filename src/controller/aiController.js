import * as aiService from '../services/aiService.js'; // Nhớ import Service vào

export const chatWithAi = async (req, res) => {
    try {
        const { message, scriptContext } = req.body;
        
        // 1. Kiểm tra đầu vào
        if (!process.env.GEMINI_API_KEY) {
            console.error("[AI Config Error]: GEMINI_API_KEY is missing in the .env file");
            return res.status(500).json({ message: "AI system configuration error." });
        }

        if (!message) {
            return res.status(400).json({ message: "Please enter a question." });
        }

        // 2. Nhờ Service gọi Gemini xử lý
        const aiReply = await aiService.generateScriptAdvice(message, scriptContext);

        // 3. Trả kết quả thành công
        return res.status(200).json({ reply: aiReply });
        
    } catch (error) {
        console.error("[Gemini API Error]:", error.message || error);
        
        // Bắt riêng lỗi 503
        if (error.message && error.message.includes("503")) {
            return res.status(200).json({ 
                reply: "Sorry, the AI service is currently overloaded due to heavy traffic. Please wait 1 minute and try again. 🚦" 
            });
        }

        return res.status(500).json({ 
            message: "Unable to connect to the AI server right now.", 
            error: error.message 
        });
    }
};