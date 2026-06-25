import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import './config/redis.js';
import http from "http";
import { Server } from "socket.io";

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
import projectSnapshotRoutes from "./route/projectSnapshotRoutes.js";
import activityLogRoutes from "./route/activityLogRoutes.js";
import { startInviteCron } from "./jobs/inviteCron.js";
import hocuspocusServer from "./config/hocuspocus.js";
import worldRoutes from './route/worldRoutes.js';
import socketService from "./services/socketService.js";
import ttsRoutes from "./route/ttsRoutes.js";
import aiRoutes from './route/aiRoutes.js';

// THÊM IMPORT CRON VÀ MODEL PAYMENT VÀO ĐÂY
import cron from 'node-cron';
import Payment from './models/payment.js'; 

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

app.use('/api/ai', aiRoutes);

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
app.use("/api/workspaces", activityLogRoutes); // GET /api/workspaces/:workspaceId/activity-logs
app.use("/api/workspaces/:workspaceId/projects", projectSnapshotRoutes); // Snapshot endpoints
app.use("/api/workspaces/:workspaceId/projects", projectRoutes);
app.use("/api/workspaces/:workspaceId/characters", characterRoutes);
app.use("/api/workspaces/:workspaceId/projects/:projectId/blocks", blockRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/workspaces/:workspaceId/snippets", snippetRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/workspaces/:workspaceId/projects/:projectId/project-assets", projectAssetRoutes);
app.use("/api/workspace-invites", workspaceInviteRoutes);
app.use("/api/workspace-members", workspaceMemberRoutes);
app.use('/api/worlds', worldRoutes);
app.use('/api/tts', ttsRoutes);
app.use("/test",testRoutes);
// Health check route
app.get("/", (req, res) => {
    res.send("SMM Project API is working!");
});

// =========================
// CRON JOBS LÊN LỊCH TỰ ĐỘNG
// =========================

// Cài đặt chạy mỗi giờ 1 lần để hủy các đơn PENDING quá hạn
cron.schedule('0 * * * *', async () => {
    try {
        // Lấy mốc thời gian: Đúng 24 giờ trước so với hiện tại
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // Quét DB: Tìm các đơn PENDING được tạo trước mốc 24h và đổi thành CANCELLED
        const result = await Payment.updateMany(
            { 
                status: 'PENDING', 
                createdAt: { $lt: twentyFourHoursAgo } 
            },
            { 
                $set: { status: 'CANCELLED' } 
            }
        );
        
        if (result.modifiedCount > 0) {
            console.log(`[Cron] Đã tự động dọn dẹp ${result.modifiedCount} giao dịch PENDING quá 24h.`);
        }
    } catch (error) {
        console.error('[Cron] Lỗi khi dọn dẹp giao dịch PENDING:', error);
    }
});

// =========================
// Start Server with Socket.IO & Hocuspocus
// =========================

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize socket service
socketService.init(io);
app.set("io", io);

server.listen(PORT, () => {
    console.log("--------------------------------------------------");
    console.log(`>>> SMM Project API is running on port: ${PORT}`);
    console.log("--------------------------------------------------");
    startInviteCron();
    hocuspocusServer.listen();
});