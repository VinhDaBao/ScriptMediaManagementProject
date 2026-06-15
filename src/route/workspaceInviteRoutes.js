import express from "express";
import {
  inviteUser,
  getInviteByToken,
  acceptInvite,
  cancelInvite,
} from "../controller/workspaceInviteController.js";

import auth from "../middlewares/authMiddleware.js";
import { authorizeWorkspace } from "../middlewares/authorMiddleware.js";
const router = express.Router();


router.post("/invite", auth,  authorizeWorkspace("OWNER"), inviteUser);

router.get("/invite/:token", getInviteByToken);

router.post("/invite/accept", auth, acceptInvite);

router.delete("/invite/:token", auth,  authorizeWorkspace("OWNER"), cancelInvite);

export default router;