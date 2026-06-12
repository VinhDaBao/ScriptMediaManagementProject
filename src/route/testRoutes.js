import express from "express";
import mongoose from "mongoose";
import User from "../models/user.js";

const router = express.Router();

console.log("TEST ROUTE LOADED");

// GET /test
router.get("/", async (req, res) => {
    try {
        const users = await User.find({});

        return res.json({
            message: "Test route is working!",
            database: {
                name: mongoose.connection.db?.databaseName || null,
                host: mongoose.connection.host || null,
                readyState: mongoose.connection.readyState
            },
            count: users.length,
            users
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching users",
            error: error.message
        });
    }
});

export default router;