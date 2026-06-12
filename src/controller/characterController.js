import characterService from '../services/characterService.js';

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ errCode: 1, message: error.message || 'Internal server error' });
};

const createCharacter = async (req, res) => {
    try {
        const character = await characterService.createCharacter(req.body);
        return res.status(201).json({ errCode: 0, message: 'Character created successfully', data: character });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllCharacters = async (req, res) => {
    try {
        const characters = await characterService.getAllCharacters();
        return res.status(200).json({ errCode: 0, message: 'Characters fetched successfully', data: characters });
    } catch (error) {
        return sendError(res, error);
    }
};

const getCharacterById = async (req, res) => {
    try {
        const character = await characterService.getCharacterById(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Character fetched successfully', data: character });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateCharacter = async (req, res) => {
    try {
        const character = await characterService.updateCharacter(req.params.id, req.body);
        return res.status(200).json({ errCode: 0, message: 'Character updated successfully', data: character });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteCharacter = async (req, res) => {
    try {
        await characterService.deleteCharacter(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Character deleted successfully' });
    } catch (error) {
        return sendError(res, error);
    }
};

export default {
    createCharacter,
    getAllCharacters,
    getCharacterById,
    updateCharacter,
    deleteCharacter,
};