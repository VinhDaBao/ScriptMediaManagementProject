import crypto from "crypto";
import WorkspaceInvite from "../models/WorkspaceInvite.js";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import WorkspaceMember from "../models/WorkspaceMember.js";

const generateToken = () =>
  crypto.randomBytes(32).toString("hex");

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

export const createInvite = async ({ workspaceId, email, role, expiresAt }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. check đã là member chưa
  const existingMember = await WorkspaceMember.findOne({
    workspaceId,
    userId: await User.findOne({ email: normalizedEmail }).select("_id"),
  });

  if (existingMember) {
    throw new Error("User is already a member");
  }

  // 2. check invite pending
  const existingInvite = await WorkspaceInvite.findOne({
    workspaceId,
    email: normalizedEmail,
    status: "PENDING",
    expiresAt: { $gt: new Date() },
  });

  if (existingInvite) {
    throw new Error("Pending invite already exists");
  }

  // 3. create invite
  return WorkspaceInvite.create({
    workspaceId,
    email: normalizedEmail,
    role: role || "VIEWER",
    token: generateToken(),
    status: "PENDING",
    expiresAt,
  });
};
const getInviteByToken = async (token) => {
  const invite = await WorkspaceInvite.findOne({ token })
    .populate({
      path: "workspaceId",
      populate: {
        path: "ownerId",
        model: "User",
        select: "fullName email",
      },
    });

  if (!invite) {
    throw new Error("Invite not found");
  }

  if (
    invite.status !== "PENDING" ||
    invite.expiresAt < new Date()
  ) {
    throw new Error("Invite expired");
  }
  return {
    _id: invite._id,
    email: invite.email,
    role: invite.role,
    status: invite.status,
    expiresAt: invite.expiresAt,

    workspace: {
      name: invite.workspaceId.name,
      description: invite.workspaceId.description,
    },

    owner: {
      fullName: invite.workspaceId.ownerId.fullName,
      email: invite.workspaceId.ownerId.email,
    },
  };
};

export const acceptInvite = async ({ token, user }) => {
  const invite = await WorkspaceInvite.findOne({ token });

  if (!invite) throw new Error("Invite not found");

  if (invite.status !== "PENDING") {
    throw new Error("Invalid invite");
  }

  if (invite.expiresAt < new Date()) {
    invite.status = "EXPIRED";
    await invite.save();
    throw new Error("Invite expired");
  }

  if (user.email !== invite.email) {
    throw new Error("Email mismatch");
  }

  // 1. check đã là member chưa (tránh duplicate)
  const existingMember = await WorkspaceMember.findOne({
    workspaceId: invite.workspaceId,
    userId: user.id,
  });

  if (!existingMember) {
    await WorkspaceMember.create({
      workspaceId: invite.workspaceId,
      userId: user.id,
      role: invite.role || "VIEWER",
    });
  }

  // 2. update invite
  invite.status = "ACCEPTED";
  await invite.save();

  return invite;
};
const cancelInvite = async (token) => {
  const invite = await WorkspaceInvite.findOne({ token });

  if (!invite) throw new Error("Invite not found");

  invite.status = "EXPIRED";
  await invite.save();

  return invite;
};

export const getInvitesByWorkspace = async (workspaceId) => {
  const invites = await WorkspaceInvite.find({
    workspaceId,
    status: "PENDING",
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  return invites;
};

export default {
  createInvite,
  getInviteByToken,
  acceptInvite,
  cancelInvite,
  getInvitesByWorkspace,
};