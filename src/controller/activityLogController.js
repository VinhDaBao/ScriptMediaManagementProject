import activityLogService from '../services/activityLogService.js';

const getWorkspaceLogs = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const logs = await activityLogService.getLogsForWorkspace(workspaceId);
    return res.status(200).json({
      errCode: 0,
      message: "Workspace activity logs fetched successfully",
      data: logs,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      errCode: 1,
      message: error.message || "Internal server error",
    });
  }
};

export default {
  getWorkspaceLogs,
};
