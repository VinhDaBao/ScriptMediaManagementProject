export const authorizeWorkspace =
  (minRole = "VIEWER") =>
  async (req, res, next) => {
    const member =
      await WorkspaceMember.findOne({
        workspaceId: req.params.workspaceId,
        userId: req.user._id,
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