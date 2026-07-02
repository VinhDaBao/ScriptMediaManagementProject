import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error(' Redis connection error:', err));
redisClient.on('connect', () => console.log('>>> Redis connected successfully!'));

redisClient.connect().catch((err) => console.error('Redis initialization error:', err));

export default redisClient;