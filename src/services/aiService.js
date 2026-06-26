import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateScriptAdvice = async (message, scriptContext) => {
    // Thêm các QUY TẮC BẮT BUỘC vào Prompt để "huấn luyện" AI
    const prompt = `Bạn là một trợ lý chuyên gia về viết kịch bản.
[QUY TẮC NGHIÊM NGẶT TỪ HỆ THỐNG]:
1. Trả lời cực kỳ ngắn gọn, súc tích, đi thẳng vào trọng tâm (tối đa 3-4 câu). Tuyệt đối không dài dòng.
2. Nếu người dùng hỏi các vấn đề tục tĩu, bậy bạ, vi phạm đạo đức, chính trị hoặc hoàn toàn không liên quan đến kịch bản/văn học, BẠN PHẢI TỪ CHỐI và chỉ đáp lại đúng một câu: "Mình là trợ lý kịch bản, mình chỉ có thể giúp bạn các vấn đề liên quan đến sáng tạo nội dung thôi nhé!".

Kịch bản hiện tại của chúng tôi:
${JSON.stringify(scriptContext || [])}

Câu hỏi/Yêu cầu của người dùng:
${message}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
    });

    return response.text;
};
