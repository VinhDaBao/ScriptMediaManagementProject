import projectService from '../services/projectService.js';

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ errCode: 1, message: error.message || 'Internal server error' });
};

const createProject = async (req, res) => {
    try {
        const project = await projectService.createProject(req.body);
        return res.status(201).json({ errCode: 0, message: 'Project created successfully', data: project });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllProjects = async (req, res) => {
    try {
        const projects = await projectService.getAllProjects();
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
        const project = await projectService.updateProject(req.params.id, req.body);
        return res.status(200).json({ errCode: 0, message: 'Project updated successfully', data: project });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteProject = async (req, res) => {
    try {
        await projectService.deleteProject(req.params.id);
        return res.status(200).json({ errCode: 0, message: 'Project deleted successfully' });
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
};