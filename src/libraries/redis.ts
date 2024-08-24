import { Redis } from "ioredis";
import { CONFIGS, DEPLOYMENT_ENV } from "@/configs";

const redisClient = new Redis(CONFIGS.REDIS_URI, {
    lazyConnect: true,
});

redisClient.on("connect", () => {
    console.log(`:::> Connected to redis database. ${DEPLOYMENT_ENV !== "production" && CONFIGS.REDIS_URI} <:::`);
});

redisClient.on("error", (error) => {
    console.error("<::: Couldn't connect to redis database", error);
});

const connectToRedis = async () => {
    await redisClient.connect();
};

export { redisClient, connectToRedis };
