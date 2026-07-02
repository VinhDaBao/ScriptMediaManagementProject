import WorkspaceMember from "../models/workspacemember.js";
import notificationService from "./notificationService.js";

/**
 * Get all members
 */
export const getWorkspaceMembers = async (workspaceId) => {
  return WorkspaceMember.find({ workspaceId })
    .populate("userId", "fullName email")
    .sort({ createdAt: 1 });
};

/**
 * Change role
 */
export const changeMemberRole = async ({ workspaceId, memberId, role }) => {
  const member = await WorkspaceMember.findOne({
    _id: memberId,
    workspaceId,
  });

  if (!member) throw new Error("Member not found in this workspace");

  // không cho sửa OWNER trực tiếp
  if (member.role === "OWNER" && role !== "OWNER") {
    throw new Error("Cannot change OWNER role directly");
  }

  let currentOwner = null;

  // 👉 transfer OWNER
  if (role === "OWNER") {
    currentOwner = await WorkspaceMember.findOne({
      workspaceId,
      role: "OWNER",
    });

    if (currentOwner && currentOwner._id.toString() !== memberId) {
      currentOwner.role = "ADMIN";
      await currentOwner.save();
    }

    member.role = "OWNER";
    await member.save();

    // Send notifications for owner transfer
    try {
      await notificationService.sendNotificationToUser({
        userId: member.userId,
        workspaceId,
        type: "WORKSPACE",
        title: "Workspace Ownership Transferred",
        message: "You are now the Owner of this workspace.",
        navigate: "/workspace/dashboard"
      });

      if (currentOwner) {
        await notificationService.sendNotificationToUser({
          userId: currentOwner.userId,
          workspaceId,
          type: "WORKSPACE",
          title: "Workspace Owner Transferred",
          message: "You have transferred workspace ownership. Your new role is Admin.",
          navigate: "/workspace/dashboard"
        });
      }
    } catch (notiError) {
      console.error("Failed to send workspace owner transfer notification:", notiError);
    }

    return {
      newOwner: member,
      oldOwner: currentOwner,
    };
  }

  // normal role update
  member.role = role;
  await member.save();

  // Send notification for normal role update
  try {
    await notificationService.sendNotificationToUser({
      userId: member.userId,
      workspaceId,
      type: "WORKSPACE",
      title: "Workspace Role Updated",
      message: `Your role in the workspace has been updated to: ${role}.`,
      navigate: "/workspace/dashboard"
    });
  } catch (notiError) {
    console.error("Failed to send workspace role change notification:", notiError);
  }

  return member;
};

export const removeMember = async ({ workspaceId, memberId }) => {
  const member = await WorkspaceMember.findOne({
    _id: memberId,
    workspaceId,
  });

  if (!member) {
    throw new Error("Member not found in this workspace");
  }

  if (member.role === "OWNER") {
    throw new Error("Cannot remove OWNER");
  }

  // Notify member before removal
  try {
    await notificationService.sendNotificationToUser({
      userId: member.userId,
      workspaceId,
      type: "WORKSPACE",
      title: "Removed from Workspace",
      message: "You have been removed from the workspace.",
      navigate: "/"
    });
  } catch (notiError) {
    console.error("Failed to send remove member notification:", notiError);
  }

  await WorkspaceMember.deleteOne({
    _id: memberId,
    workspaceId,
  });

  return true;
};

/**
 * Leave workspace
 */
export const leaveWorkspace = async ({ workspaceId, userId }) => {
  const member = await WorkspaceMember.findOne({
    workspaceId,
    userId,
  });

  if (!member) {
    throw new Error("Not a member");
  }

  if (member.role === "OWNER") {
    throw new Error("Owner cannot leave workspace");
  }

  // Notify other members or admin (optional, let's keep it simple)

  await WorkspaceMember.deleteOne({ _id: member._id });

  return true;
};

/**
 * Add member
 */
export const addMember = async ({
  workspaceId,
  userId,
  role = "VIEWER",
  invitedBy,
}) => {
  const exists = await WorkspaceMember.findOne({
    workspaceId,
    userId,
  });

  if (exists) {
    throw new Error("User already in workspace");
  }

  const member = await WorkspaceMember.create({
    workspaceId,
    userId,
    role,
    invitedBy,
  });

  // Notify the newly added user
  try {
    await notificationService.sendNotificationToUser({
      userId,
      workspaceId,
      type: "WORKSPACE",
      title: "Added to Workspace",
      message: `You have been added to the workspace as ${role}.`,
      navigate: "/workspace/dashboard"
    });
  } catch (notiError) {
    console.error("Failed to send add member notification:", notiError);
  }

  return member;
};

export default {
  getWorkspaceMembers,
  changeMemberRole,
  removeMember,
  leaveWorkspace,
  addMember,
};