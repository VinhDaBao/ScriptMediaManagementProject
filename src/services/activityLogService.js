import ActivityLog from "../models/activityLog.js";

const createLog = async ({ workspaceId, userId, entityType, entityId, action, metadata }) => {
  try {
    return await ActivityLog.create({
      workspaceId,
      userId,
      entityType,
      entityId,
      action,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error("[ActivityLog] Failed to create activity log:", error);
  }
};

const getLogsForWorkspace = async (workspaceId) => {
  return await ActivityLog.find({ workspaceId })
    .populate("userId", "fullName email")
    .sort({ createdAt: -1 })
    .limit(100);
};

export default {
  createLog,
  getLogsForWorkspace,
};
