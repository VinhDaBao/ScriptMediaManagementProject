import { CronJob } from 'cron';
import WorkspaceInvite from "../models/workspaceinvite.js";

const checkExpiredInvites = async () => {
  try {
    const result = await WorkspaceInvite.updateMany(
      {
        status: "PENDING",
        expiresAt: { $lt: new Date() },
      },
      {
        $set: { status: "EXPIRED" },
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Cron] Expired ${result.modifiedCount} pending invites.`);
    }
  } catch (error) {
    console.error("[Cron] Error checking expired invites:", error);
  }
};

export const startInviteCron = () => {
  // Run once immediately on startup
  checkExpiredInvites();

  // Schedule to run every hour at minute 0: "0 * * * *"
  const job = new CronJob('0 * * * *', checkExpiredInvites);

  job.start();
  console.log("[Cron] Workspace invite expiration cron started (interval: 1 hour).");
};
