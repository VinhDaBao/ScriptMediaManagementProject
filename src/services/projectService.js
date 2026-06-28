import mongoose from 'mongoose';
import Project from '../models/project.js';
import Block from '../models/block.js';
import ProjectAsset from '../models/projectAsset.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const createProject = async (data, userId) => {
    const requiredFields = ['workspaceId', 'title'];
    const missingField = requiredFields.find((field) => !data?.[field]);

    if (missingField) {
        throw buildValidationError(`Missing required field: ${missingField}`);
    }

    if (!isValidObjectId(data.workspaceId)) {
        throw buildValidationError('Invalid workspaceId');
    }

    if (!userId || !isValidObjectId(userId)) {
        throw buildValidationError('Invalid user id for creation');
    }

    return await Project.create({
        workspaceId: data.workspaceId,
        title: data.title,
        description: data.description ?? '',
        status: data.status ?? 'IDEA',
        tags: Array.isArray(data.tags) ? data.tags : [],
        createdBy: userId,
        lastEditedBy: userId,
    });
};

// ==========================================
// 🌟 ĐÃ SỬA: Lấy chi tiết Avatar và đếm số Asset
// ==========================================
const getAllProjects = async (workspaceId) => {
    if (!workspaceId) {
        throw buildValidationError('workspaceId is required');
    }
    if (!isValidObjectId(workspaceId)) {
        throw buildValidationError('Invalid workspaceId');
    }

    // 1. Lấy Project và "nhúng" (populate) thông tin người tạo + người sửa cuối
    let projects = await Project.find({ workspaceId })
        .populate('createdBy', 'fullName email avatar')
        .populate('lastEditedBy', 'fullName email avatar')
        .sort({ createdAt: -1 })
        .lean(); // lean() giúp biến object Mongoose thành mảng JS thuần để dễ thêm field

    // 2. Gom ID của các project lại để tìm tổng số Asset
    const projectIds = projects.map(p => p._id);
    const assetCounts = await ProjectAsset.aggregate([
        { $match: { projectId: { $in: projectIds } } },
        { $group: { _id: '$projectId', count: { $sum: 1 } } }
    ]);

    // 3. Ghép số đếm Asset và gộp Avatar vào từng project
    projects = projects.map(p => {
        const assetData = assetCounts.find(a => String(a._id) === String(p._id));
        
        // Gộp người tạo và người sửa cuối (nếu khác nhau) thành mảng members để UI hiện 2 avatar
        let members = [];
        if (p.createdBy) members.push(p.createdBy);
        if (p.lastEditedBy && String(p.lastEditedBy._id) !== String(p.createdBy?._id)) {
            members.push(p.lastEditedBy);
        }

        return {
            ...p,
            assetCount: assetData ? assetData.count : 0, // Nhét số lượng Asset vào
            members: members // Nhét mảng members vào cho Frontend đọc
        };
    });

    return projects;
};

const getProjectById = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid project id');
    }

    const project = await Project.findById(id)
        .populate('createdBy', 'fullName email avatar')
        .populate('lastEditedBy', 'fullName email avatar');

    if (!project) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    return project;
};

const updateProject = async (id, data, userId) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid project id');
    }

    const project = await Project.findById(id);

    if (!project) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    if (data.workspaceId !== undefined) {
        if (!isValidObjectId(data.workspaceId)) {
            throw buildValidationError('Invalid workspaceId');
        }
        project.workspaceId = data.workspaceId;
    }

    if (data.title !== undefined) project.title = data.title;
    if (data.description !== undefined) project.description = data.description;
    if (data.status !== undefined) project.status = data.status;
    if (data.tags !== undefined) project.tags = Array.isArray(data.tags) ? data.tags : [];

    if (userId) {
        project.lastEditedBy = userId;
    }

    return await project.save();
};

const deleteProject = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid project id');
    }

    const project = await Project.findById(id);

    if (!project) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    // Delete associated blocks when project is deleted
    await Block.deleteMany({ projectId: id });

    // Cập nhật: Nên xóa luôn các ProjectAsset liên quan để tránh rác DB
    await ProjectAsset.deleteMany({ projectId: id });

    await project.deleteOne();
    return { deleted: true };
};

const duplicateProject = async (projectId, userId) => {
    if (!isValidObjectId(projectId)) {
        throw buildValidationError('Invalid project id');
    }

    const original = await Project.findById(projectId);
    if (!original) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        throw error;
    }

    // Duplicate project metadata
    const duplicate = await Project.create({
        workspaceId: original.workspaceId,
        title: `${original.title} (Copy)`,
        description: original.description,
        status: original.status,
        tags: original.tags,
        createdBy: userId,
        lastEditedBy: userId,
    });

    // Load original blocks
    const originalBlocks = await Block.find({ projectId }).sort({ position: 1 });

    // Duplicate blocks with deep copy of content field
    const duplicatedBlocks = originalBlocks.map((b) => ({
        projectId: duplicate._id,
        type: b.type,
        position: b.position,
        content: b.content && typeof b.content === 'object' ? JSON.parse(JSON.stringify(b.content)) : b.content,
    }));

    if (duplicatedBlocks.length > 0) {
        await Block.insertMany(duplicatedBlocks);
    }

    // Duplicate project asset associations
    const originalProjectAssets = await ProjectAsset.find({ projectId });
    const duplicatedProjectAssets = originalProjectAssets.map((pa) => ({
        projectId: duplicate._id,
        assetId: pa.assetId,
        status: pa.status,
        usageCount: pa.usageCount,
        lastUsedAt: pa.lastUsedAt,
    }));

    if (duplicatedProjectAssets.length > 0) {
        await ProjectAsset.insertMany(duplicatedProjectAssets);
    }

    return duplicate;
};

export default {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    duplicateProject,
};