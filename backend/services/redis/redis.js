import { createClient } from 'redis';

const redis = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

redis.on('error', err => console.log('Redis Client Error', err));
redis.on('connect', () => console.log('Redis Client Connected'));
await redis.connect();
export { redis };


