import express from "express";
import {
  inviteUser,
  getInviteByToken,
  acceptInvite,
  cancelInvite,
  getInvitesByWorkspace
} from "../controller/workspaceInviteController.js";

import auth from "../middlewares/authMiddleware.js";
import { authorizeWorkspace } from "../middlewares/authorMiddleware.js";
const router = express.Router();


router.post("/:workspaceId/invite", auth,  authorizeWorkspace("OWNER"), inviteUser);

router.get("/invite/:token", getInviteByToken);

router.post("/accept", auth, acceptInvite);

router.delete("/:workspaceId/invite/:token", auth,  authorizeWorkspace("OWNER"), cancelInvite);
router.get(
  "/workspace/:workspaceId",
  auth,
  authorizeWorkspace("OWNER"),
  getInvitesByWorkspace
);
export default router;