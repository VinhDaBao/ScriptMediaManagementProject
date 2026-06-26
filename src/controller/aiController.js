import * as aiService from '../services/aiService.js'; // Nhớ import Service vào

export const chatWithAi = async (req, res) => {
    try {
        const { message, scriptContext } = req.body;
        
        // 1. Kiểm tra đầu vào
        if (!process.env.GEMINI_API_KEY) {
            console.error("[AI Config Error]: Thiếu GEMINI_API_KEY trong file .env");
            return res.status(500).json({ message: "Lỗi cấu hình hệ thống AI." });
        }

        if (!message) {
            return res.status(400).json({ message: "Vui lòng nhập câu hỏi." });
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
                reply: "Xin lỗi, hiện tại tổng đài AI đang bị kẹt xe do quá đông người sử dụng. Bạn vui lòng đợi 1 phút rồi hỏi lại mình nhé! 🚦" 
            });
        }

        return res.status(500).json({ 
            message: "Không thể kết nối đến máy chủ AI lúc này.", 
            error: error.message 
        });
    }
};