import characterService from '../services/characterService.js';
import activityLogService from '../services/activityLogService.js';

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ errCode: 1, message: error.message || 'Internal server error' });
};

const createCharacter = async (req, res) => {
    try {
        req.body.workspaceId = req.params.workspaceId;
        const character = await characterService.createCharacter(req.body);

        // Activity log
        await activityLogService.createLog({
            workspaceId: character.workspaceId,
            userId: req.user.id,
            entityType: "CHARACTER",
            entityId: character._id,
            action: "CREATE",
            metadata: {
                name: character.name,
            },
        });

        return res.status(201).json({ errCode: 0, message: 'Character created successfully', data: character });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllCharacters = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const characters = await characterService.getAllCharacters(workspaceId);
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
        const updated = await characterService.updateCharacter(req.params.id, req.body);

        // Activity log
        await activityLogService.createLog({
            workspaceId: updated.workspaceId,
            userId: req.user.id,
            entityType: "CHARACTER",
            entityId: updated._id,
            action: "UPDATE",
            metadata: {
                name: updated.name,
            },
        });

        return res.status(200).json({ errCode: 0, message: 'Character updated successfully', data: updated });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteCharacter = async (req, res) => {
    try {
        const { id } = req.params;
        const character = await characterService.getCharacterById(id);

        await characterService.deleteCharacter(id);

        // Tạo Activity Log ghi nhận hành động XÓA
        await activityLogService.createLog({
            workspaceId: req.params.workspaceId,
            userId: req.user.id,
            entityType: "CHARACTER",
            entityId: id,
            action: "DELETE",
            metadata: {
                name: character.name,
            },
        });

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