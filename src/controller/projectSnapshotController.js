import projectSnapshotService from '../services/projectSnapshotService.js';

const sendError = (res, error) => {
  console.error("Snapshot Controller Error:", error);
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({ errCode: 1, message: error.message || 'Internal server error' });
};

const createSnapshot = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, changeSummary } = req.body || {};
    const snapshot = await projectSnapshotService.createSnapshot({
      projectId,
      title,
      changeSummary,
      snapshotType: "MANUAL",
      userId: req.user.id,
    });
    return res.status(201).json({
      errCode: 0,
      message: "Snapshot created successfully",
      data: snapshot,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getProjectSnapshots = async (req, res) => {
  try {
    const { projectId } = req.params;
    const snapshots = await projectSnapshotService.getSnapshotsByProject(projectId);
    return res.status(200).json({
      errCode: 0,
      message: "Project snapshots fetched successfully",
      data: snapshots,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const restoreSnapshot = async (req, res) => {
  try {
    const { snapshotId } = req.params;
    const restored = await projectSnapshotService.restoreSnapshot(snapshotId, req.user.id);
    return res.status(200).json({
      errCode: 0,
      message: "Project state restored successfully",
      data: restored,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export default {
  createSnapshot,
  getProjectSnapshots,
  restoreSnapshot,
};
