// src/models/index.js
import mongoose from 'mongoose';
import User from './user.js'; // Nhớ đuôi .js
import World from './world.js';
import WorldNode from './worldNode.js';
import WorldEdge from './worldEdge.js';

const db = {};
db.mongoose = mongoose;
db.User = User;
db.World = World;
db.WorldNode = WorldNode;
db.WorldEdge = WorldEdge;

export default db;
