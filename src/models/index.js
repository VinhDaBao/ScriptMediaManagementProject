// src/models/index.js
import mongoose from 'mongoose';
import User from './user.js'; // Nhớ đuôi .js

const db = {};
db.mongoose = mongoose;
db.User = User;

export default db;