import ProjectSnapshot from '../models/projectSnapshot.js';
import Block from '../models/block.js';
import Project from '../models/project.js';
import activityLogService from './activityLogService.js';

const createSnapshot = async ({ projectId, title, changeSummary, snapshotType, userId }) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  // Load current blocks
  const blocks = await Block.find({ projectId }).sort({ position: 1 });
  const snapshotBlocks = blocks.map((b) => ({
    blockId: b._id,
    type: b.type,
    position: b.position,
    content: b.content,
  }));

  // Determine version
  const lastSnapshot = await ProjectSnapshot.findOne({ projectId }).sort({ version: -1 });
  const version = lastSnapshot ? lastSnapshot.version + 1 : 1;

  const snapshot = await ProjectSnapshot.create({
    projectId,
    version,
    title: title || `Version ${version}`,
    changeSummary: changeSummary || "",
    snapshotType: snapshotType || "AUTO",
    blocks: snapshotBlocks,
    createdBy: userId,
  });

  // Retain maximum 30 snapshots per project
  const snapshotsCount = await ProjectSnapshot.countDocuments({ projectId });
  if (snapshotsCount > 30) {
    const oldestSnapshots = await ProjectSnapshot.find({ projectId })
      .sort({ version: 1 })
      .limit(snapshotsCount - 30);
    const deleteIds = oldestSnapshots.map((s) => s._id);
    await ProjectSnapshot.deleteMany({ _id: { $in: deleteIds } });
  }

  // Activity logging
  await activityLogService.createLog({
    workspaceId: project.workspaceId,
    userId,
    entityType: "SNAPSHOT",
    entityId: snapshot._id,
    action: "CREATE",
    metadata: {
      projectId,
      projectTitle: project.title,
      snapshotVersion: version,
      snapshotType: snapshot.snapshotType,
    },
  });

  return snapshot;
};

const getSnapshotsByProject = async (projectId) => {
  return await ProjectSnapshot.find({ projectId })
    .populate("createdBy", "fullName email")
    .sort({ version: -1 });
};

const restoreSnapshot = async (snapshotId, userId) => {
  const snapshot = await ProjectSnapshot.findById(snapshotId);
  if (!snapshot) throw new Error("Snapshot not found");

  const project = await Project.findById(snapshot.projectId);
  if (!project) throw new Error("Project not found");

  // Clear current blocks
  await Block.deleteMany({ projectId: snapshot.projectId });

  // Insert snapshot blocks
  const blocksToInsert = snapshot.blocks.map((b) => ({
    projectId: snapshot.projectId,
    type: b.type,
    position: b.position,
    content: b.content,
  }));

  if (blocksToInsert.length > 0) {
    await Block.insertMany(blocksToInsert);
  }

  // Activity logging
  await activityLogService.createLog({
    workspaceId: project.workspaceId,
    userId,
    entityType: "SNAPSHOT",
    entityId: snapshot._id,
    action: "RESTORE_SNAPSHOT",
    metadata: {
      projectId: snapshot.projectId,
      projectTitle: project.title,
      snapshotVersion: snapshot.version,
    },
  });

  return snapshot;
};

export default {
  createSnapshot,
  getSnapshotsByProject,
  restoreSnapshot,
};
