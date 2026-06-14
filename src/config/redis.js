import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error(' Lỗi kết nối Redis:', err));
redisClient.on('connect', () => console.log('>>> Kết nối Redis thành công!'));

redisClient.connect().catch((err) => console.error('Lỗi khởi tạo Redis:', err));

export default redisClient;