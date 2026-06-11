import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import User from "./models/user.js";
// Internal imports
import connectDB from "./config/configdb.js";
import authRoutes from "./route/authRoutes.js";
import testRoutes from "./route/testRoutes.js";

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

// =========================
// Database Connection
// =========================

connectDB();
// =========================
// Routes
// =========================

// Auth APIs
app.use("/api/auth", authRoutes);
app.use("/test",testRoutes);
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
});