import WorkspaceMember from "../models/WorkspaceMember.js";
const ROLE_LEVEL = {
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
  OWNER: 4,
};
export const authorizeWorkspace =
  (minRole = "VIEWER") =>
  async (req, res, next) => {
    const member =
      await WorkspaceMember.findOne({
        workspaceId: req.params.workspaceId|| req.body.workspaceId,
        userId: req.user.id,
      });
    if (!member) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (
      ROLE_LEVEL[member.role] <
      ROLE_LEVEL[minRole]
    ) {
      return res.status(403).json({
        message: "Insufficient permission",
      });
    }

    req.workspaceMember = member;

    next();
  };