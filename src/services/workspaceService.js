import mongoose from 'mongoose';
import Workspace from '../models/workspace.js';
import WorkspaceMember from '../models/workspacemember.js';
import Subscription from '../models/subscription.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildValidationError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const resolveOwnerId = (data, userId) => userId || data?.ownerId;

const createWorkspace = async (data) => {
    const { name, description, ownerId } = data;

    // 1. Kiểm tra gói dịch vụ hiện tại
    const activeSub = await Subscription.findOne({ 
        userId: ownerId, 
        status: "ACTIVE" 
    }).populate('planId');

    let workspaceLimit = 3; 
    if (activeSub && activeSub.planId) {
        workspaceLimit = activeSub.planId.limits?.workspace || 9999;
    }

    // 2. Đếm số Workspace đang sở hữu
    const currentWorkspaceCount = await Workspace.countDocuments({ ownerId: ownerId });

    if (currentWorkspaceCount >= workspaceLimit) {
        // Ném lỗi 400 (Bad Request) để Frontend bắt được thay vì 200
        const error = new Error(`Tài khoản của bạn đã đạt giới hạn tối đa ${workspaceLimit} Workspace. Vui lòng nâng cấp gói dịch vụ để tạo thêm!`);
        error.statusCode = 400; 
        throw error;
    }

    // 3. Tạo Workspace
    const newWorkspace = await Workspace.create({
        name,
        description,
        ownerId,
    });

    // 🌟 QUAN TRỌNG: Thêm người tạo vào danh sách Member để nó hiện lên UI! 🌟
    await WorkspaceMember.create({
        workspaceId: newWorkspace._id,
        userId: ownerId,
        role: 'OWNER'
    });

    return newWorkspace;
};

const getAllWorkspaces = async (userId) => {
    if (!isValidObjectId(userId)) {
        throw buildValidationError('Invalid user id');
    }

    const memberships = await WorkspaceMember.find({ userId })
        .populate('workspaceId')
        .sort({ createdAt: -1 });

    return memberships
        .filter((membership) => membership.workspaceId)
        .map((membership) => ({
            ...membership.workspaceId.toObject(),
            memberRole: membership.role,
        }));
};

const getWorkspaceById = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid workspace id');
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
        const error = new Error('Workspace not found');
        error.statusCode = 404;
        throw error;
    }

    return workspace;
};

const updateWorkspace = async (id, data) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid workspace id');
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
        const error = new Error('Workspace not found');
        error.statusCode = 404;
        throw error;
    }

    if (data.name !== undefined) workspace.name = data.name;
    if (data.description !== undefined) workspace.description = data.description;
    if (data.ownerId !== undefined) {
        if (!isValidObjectId(data.ownerId)) {
            throw buildValidationError('Invalid ownerId');
        }
        workspace.ownerId = data.ownerId;
    }

    return await workspace.save();
};

const deleteWorkspace = async (id) => {
    if (!isValidObjectId(id)) {
        throw buildValidationError('Invalid workspace id');
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
        const error = new Error('Workspace not found');
        error.statusCode = 404;
        throw error;
    }

    await WorkspaceMember.deleteMany({ workspaceId: id });
    await workspace.deleteOne();
    return { deleted: true };
};

export default {
    createWorkspace,
    getAllWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace,
};