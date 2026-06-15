import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import './config/redis.js';

import connectDB from "./config/configdb.js";
import authRoutes from "./route/authRoutes.js";
import testRoutes from "./route/testRoutes.js";
import assetRoutes from "./route/assetRoutes.js";
import workspaceRoutes from "./route/workspaceRoutes.js";
import projectRoutes from "./route/projectRoutes.js";
import characterRoutes from "./route/characterRoutes.js";
import blockRoutes from "./route/blockRoutes.js";
import notificationRoutes from "./route/notificationRoutes.js";
import paymentRoutes from "./route/paymentRoutes.js";
import planRoutes from "./route/planRoutes.js";
import snippetRoutes from "./route/snippetRoutes.js";
import subscriptionRoutes from "./route/subscriptionRoutes.js";
import projectAssetRoutes from "./route/projectAssetRoutes.js";
import workspaceInviteRoutes from "./route/workspaceInviteRoutes.js";
import workspaceMemberRoutes from "./route/workspaceMemberRoutes.js";
import { startInviteCron } from "./jobs/inviteCron.js";
// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// =========================
// Middleware
// =========================

app.use(cors({ origin: true }));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/images', express.static('src/public/images'));

app.use('/api/assets', assetRoutes);

// =========================
// Database Connection
// =========================

connectDB();
// =========================
// Routes
// =========================
app.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.url);
    next();
});
// Auth APIs
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/blocks", blockRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/snippets", snippetRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/project-assets", projectAssetRoutes);
app.use("/api/workspace-invites", workspaceInviteRoutes);
app.use("/api/workspace-members", workspaceMemberRoutes);
app.use("/test", testRoutes);
// Health check route
app.get("/", (req, res) => {
    res.send("SMM Project API is working!");
});

// =========================
// Start Server
// =========================

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {

    console.log("--------------------------------------------------");

    console.log(`>>> SMM Project API is running on port: ${PORT}`);

    console.log("--------------------------------------------------");
    startInviteCron();
});