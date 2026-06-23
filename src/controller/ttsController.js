import ttsService from '../services/ttsService.js';

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
        errCode: 1,
        message: error.message || 'Internal server error',
    });
};

const synthesize = async (req, res) => {
    try {
        const { text, voice } = req.body;
        if (!text || typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({
                errCode: 1,
                message: 'Text field is required and must be a non-empty string',
            });
        }

        const audioBase64 = await ttsService.synthesizeText(text, voice);
        return res.status(200).json({
            errCode: 0,
            audioBase64
        });
    } catch (error) {
        console.error('Error during TTS synthesis:', error);
        return sendError(res, error);
    }
};

const getVoices = async (req, res) => {
    try {
        const voices = await ttsService.listVoices();
        return res.status(200).json({
            errCode: 0,
            data: voices
        });
    } catch (error) {
        console.error('Error listing voices:', error);
        return sendError(res, error);
    }
};

export default {
    synthesize,
    getVoices
};
