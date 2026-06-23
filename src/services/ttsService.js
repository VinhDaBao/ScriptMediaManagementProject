import textToSpeech from '@google-cloud/text-to-speech';
import path from 'path';

// Initialize client using rosy-semiotics-478315-m6-bba971d1f8e5.json
const client = new textToSpeech.TextToSpeechClient({
    keyFilename: path.join(__dirname, '../../rosy-semiotics-478315-m6-bba971d1f8e5.json')
});

const synthesizeText = async (text, voiceName) => {
    if (!text || typeof text !== 'string') {
        const error = new Error('Text is required and must be a string');
        error.statusCode = 400;
        throw error;
    }

    const name = voiceName || 'en-US-Neural2-F';
    // Extract language code: e.g. en-US-Neural2-F -> en-US
    const parts = name.split('-');
    const languageCode = parts.slice(0, 2).join('-');

    const request = {
        input: { text },
        voice: { name, languageCode },
        audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);

    if (!response.audioContent) {
        throw new Error('Failed to generate audio content from TTS API');
    }

    // Convert audio content to base64
    return response.audioContent.toString('base64');
};

const listVoices = async () => {
    const [response] = await client.listVoices({});
    if (!response.voices) return [];
    
    return response.voices.map(v => ({
        name: v.name,
        languageCodes: v.languageCodes,
        ssmlGender: v.ssmlGender
    }));
};

export default {
    synthesizeText,
    listVoices
};
