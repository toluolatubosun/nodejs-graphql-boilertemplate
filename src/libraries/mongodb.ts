import mongoose from "mongoose";
import { DEPLOYMENT_ENV, CONFIGS } from "@/configs";

const connectMongoDB = async () => {
    try {
        mongoose.connect(CONFIGS.MONGODB_URI);

        console.log(`:::> Connected to mongoDB database. ${DEPLOYMENT_ENV !== "production" && CONFIGS.MONGODB_URI}`);
    } catch (error) {
        console.error("<::: Couldn't connect to database", error);
    }
};

export { connectMongoDB };
