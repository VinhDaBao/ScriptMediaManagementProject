import WorkspaceMember from "../models/WorkspaceMember.js";

/**
 * Get all members
 */
export const getWorkspaceMembers = async (workspaceId) => {
  return WorkspaceMember.find({ workspaceId })
    .populate("userId", "fullName email avatar")
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

  // 👉 transfer OWNER
  if (role === "OWNER") {
    const currentOwner = await WorkspaceMember.findOne({
      workspaceId,
      role: "OWNER",
    });

    if (currentOwner && currentOwner._id.toString() !== memberId) {
      currentOwner.role = "ADMIN";
      await currentOwner.save();
    }

    member.role = "OWNER";
    await member.save();

    return {
      newOwner: member,
      oldOwner: currentOwner,
    };
  }

  // normal role update
  member.role = role;
  await member.save();

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

  return WorkspaceMember.create({
    workspaceId,
    userId,
    role,
    invitedBy,
  });
};