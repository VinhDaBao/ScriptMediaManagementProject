import inviteService from "../services/workspaceInviteService.js";
import transporter from "../config/mailer.js";
import Workspace from "../models/workspace.js";
const inviteEmailTemplate = ({
  workspace,
  owner,
  role,
  link,
  expiresAt,
}) => {
  return `
  <div style="font-family: Arial; background:#f6f7fb; padding:30px;">
    <div style="max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:10px;">

      <h2 style="color:#333;">You're invited to join a workspace</h2>

      <p>
        <b>${owner.fullName}</b> invited you to join:
      </p>

      <div style="padding:15px;background:#f0f2f5;border-radius:8px;">
        <h3 style="margin:0;">${workspace.name}</h3>
        <p style="margin:5px 0;color:#555;">
          ${workspace.description || "No description"}
        </p>
      </div>

      <p style="margin-top:15px;">
        Role granted: <b>${role}</b>
      </p>

      <p>
        This invitation will expire on:
        <b>${new Date(expiresAt).toLocaleString()}</b>
      </p>

      <div style="text-align:center;margin:25px 0;">
        <a href="${link}"
           style="background:#4f46e5;color:white;padding:12px 20px;
           text-decoration:none;border-radius:6px;display:inline-block;">
          Accept Invitation
        </a>
      </div>

      <p style="font-size:12px;color:#888;">
        If you didn’t expect this invitation, you can ignore this email.
      </p>

    </div>
  </div>
  `;
};
export const inviteUser = async (req, res) => {
  try {
    const { workspaceId, email, role, expiresAt } = req.body;
    const workspace = await Workspace.findById(workspaceId).populate("ownerId");
    const invite = await inviteService.createInvite({
      workspaceId,
      email,
      role,
      expiresAt,
    });

    const link = `${process.env.CLIENT_URL}/invite/${invite.token}`;

    await transporter.sendMail({
      to: email,
      subject: `Invitation to join ${workspace.name}`,
      html: inviteEmailTemplate({
        workspace,
        owner: workspace.ownerId,
        role,
        link,
        expiresAt,
      }),
    });

    res.json(invite);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getInviteByToken = async (req, res) => {
  try {
    const invite = await inviteService.getInviteByToken(
      req.params.token
    );
    console.log("Invite found:", invite);
    res.json(invite);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const acceptInvite = async (req, res) => {
  try {
    const invite = await inviteService.acceptInvite({
      token: req.body.token,
      user: req.user,
    });

    res.json(invite);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const cancelInvite = async (req, res) => {
  try {
    const invite = await inviteService.cancelInvite(
      req.params.token
    );

    res.json(invite);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
export const getInvitesByWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const invites = await inviteService.getInvitesByWorkspace(workspaceId);

    return res.status(200).json({
      errCode: 0,
      message: "Get invites success",
      data: invites,
    });
  } catch (error) {
    return sendError(res, error);
  }
};