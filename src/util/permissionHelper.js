import WorkspaceMember from "../models/workspacemember.js";

const ROLE_LEVEL = {
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
  OWNER: 4,
};

export const verifyWorkspaceRole = async (workspaceId, userId, minRole = "VIEWER") => {
  if (!workspaceId || !userId) return false;
  const member = await WorkspaceMember.findOne({ workspaceId, userId });
  if (!member) return false;
  return ROLE_LEVEL[member.role] >= ROLE_LEVEL[minRole];
};
