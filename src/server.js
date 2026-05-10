import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Internal imports
import connectDB from "./config/configdb.js";
import authRoutes from "./route/authRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// =========================
// Middleware
// =========================

app.use(cors({ origin: true }));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// =========================
// Database Connection
// =========================

connectDB();

// =========================
// Routes
// =========================

// Auth APIs
app.use("/api/auth", authRoutes);

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