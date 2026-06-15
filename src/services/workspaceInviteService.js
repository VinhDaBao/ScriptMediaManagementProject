import crypto from "crypto";
import WorkspaceInvite from "../models/WorkspaceInvite.js";

const generateToken = () =>
  crypto.randomBytes(32).toString("hex");

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const createInvite = async ({ workspaceId, email, role, expiresAt }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await WorkspaceInvite.findOne({
    workspaceId,
    email: normalizedEmail,
    status: "PENDING",
    expiresAt: { $gt: new Date() },
  });

  if (existing) {
    throw new Error("Pending invite already exists");
  }

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
  const invite = await WorkspaceInvite.findOne({ token }).populate(
    "workspaceId"
  );

  if (!invite) throw new Error("Invite not found");

  if (invite.status !== "PENDING" || invite.expiresAt < new Date()) {
    throw new Error("Invite expired");
  }

  return invite;
};

const acceptInvite = async ({ token, user }) => {
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

export default {
  createInvite,
  getInviteByToken,
  acceptInvite,
  cancelInvite,
};