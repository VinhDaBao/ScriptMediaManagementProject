import express from 'express';
import User from '../models/user.js'; // Đảm bảo import model User để truy vấn database
import mongoose from 'mongoose'; // Import mongoose để kiểm tra kết nối database
const route = express.Router();
console.log("TEST ROUTE LOADED");
route.get('/test', async (req, res) => {
    try {
        const users = await User.find({});

        res.json({
            message: 'Test route is working!',
            database: {
                name: mongoose.connection.db?.databaseName || 'No database connected',
                host: mongoose.connection.host || 'No host information'
            },
            users
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error fetching users',
            error: error.message
        });
    }
});
export default route;