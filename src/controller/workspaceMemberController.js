import * as service from "../services/workspaceMemberService.js";

/**
 * GET members
 */
export const getMembers = async (req, res) => {
  try {
    console.log(req.user.id);
    console.log(req.params.workspaceId);
    const members = await service.getWorkspaceMembers(req.params.workspaceId);

    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const changeRole = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;
    const { role } = req.body;

    const result = await service.changeMemberRole({
      workspaceId,
      memberId,
      role,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;

    await service.removeMember({
      workspaceId,
      memberId,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const leaveWorkspace = async (req, res) => {
  try {
    await service.leaveWorkspace({
      workspaceId: req.params.workspaceId,
      userId: req.user.id,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};