import projectService from '../services/projectService.js';
import activityLogService from '../services/activityLogService.js';

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ errCode: 1, message: error.message || 'Internal server error' });
};

const createProject = async (req, res) => {
    try {
        req.body.workspaceId = req.params.workspaceId;
        const project = await projectService.createProject(req.body, req.user.id);

        // Activity log
        await activityLogService.createLog({
            workspaceId: project.workspaceId,
            userId: req.user.id,
            entityType: "PROJECT",
            entityId: project._id,
            action: "CREATE",
            metadata: {
                title: project.title,
            },
        });

        return res.status(201).json({ errCode: 0, message: 'Project created successfully', data: project });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllProjects = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const projects = await projectService.getAllProjects(workspaceId);
        return res.status(200).json({ errCode: 0, message: 'Projects fetched successfully', data: projects });
    } catch (error) {
        return sendError(res, error);
    }
};

const getProjectById = async (req, res) => {
    try {
        const project = await projectService.getProjectById(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Project fetched successfully', data: project });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateProject = async (req, res) => {
    try {
        const updated = await projectService.updateProject(req.params.id, req.body, req.user.id);

        // Activity log
        await activityLogService.createLog({
            workspaceId: updated.workspaceId,
            userId: req.user.id,
            entityType: "PROJECT",
            entityId: updated._id,
            action: "UPDATE",
            metadata: {
                title: updated.title,
                changedFields: Object.keys(req.body),
            },
        });

        return res.status(200).json({ errCode: 0, message: 'Project updated successfully', data: updated });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteProject = async (req, res) => {
    try {
        const project = await projectService.getProjectById(req.params.id);
        await projectService.deleteProject(req.params.id);

        // Activity log
        await activityLogService.createLog({
            workspaceId: project.workspaceId,
            userId: req.user.id,
            entityType: "PROJECT",
            entityId: project._id,
            action: "DELETE",
            metadata: {
                title: project.title,
            },
        });

        return res.status(200).json({ errCode: 0, message: 'Project deleted successfully' });
    } catch (error) {
        return sendError(res, error);
    }
};

const duplicateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const duplicate = await projectService.duplicateProject(id, req.user.id);

        // Activity log
        await activityLogService.createLog({
            workspaceId: duplicate.workspaceId,
            userId: req.user.id,
            entityType: "PROJECT",
            entityId: duplicate._id,
            action: "DUPLICATE",
            metadata: {
                originalProjectId: id,
                title: duplicate.title,
            },
        });

        return res.status(201).json({
            errCode: 0,
            message: "Project duplicated successfully",
            data: duplicate,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export default {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    duplicateProject,
};