import ms from "ms";
import dotenv from "dotenv";

dotenv.config();

const CONFIGS = {
    PORT: process.env.PORT || 8000,
    APP_NAME: "my-apollo-server-express-starter",
    NODE_ENV: process.env.NODE_ENV || "development",
    CLOUDINARY_URL: process.env.CLOUDINARY_URL || "",
    BCRYPT_SALT: Number(process.env.BCRYPT_SALT) || 10,
    JWT_SECRET: process.env.JWT_SECRET || "my-apollo-server-express-starter",
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/my-apollo-server-express-starter",
    DEFAULT_DB_TOKEN_EXPIRES_MS: process.env.DEFAULT_TOKEN_EXPIRES_IN ? ms(process.env.DEFAULT_TOKEN_EXPIRES_IN) : ms("1h"),
    ACCESS_TOKEN_JWT_EXPIRES_MS: process.env.ACCESS_TOKEN_JWT_EXPIRES_IN ? ms(process.env.ACCESS_TOKEN_JWT_EXPIRES_IN) : ms("1h"),
    REFRESH_TOKEN_JWT_EXPIRES_MS: process.env.REFRESH_TOKEN_JWT_EXPIRES_IN ? ms(process.env.REFRESH_TOKEN_JWT_EXPIRES_IN) : ms("30d"),
    URL: {
        CLIENT_BASE_URL: process.env.CLIENT_BASE_URL || "http://localhost:3000",
        BASE_URL: process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`
    },
    ROLES: {
        ADMIN: ["admin"],
        USER: ["user", "admin"]
    },
    MAILER: {
        SMTP_USER: process.env.MAILER_SMTP_USER || "",
        SMTP_PORT: process.env.MAILER_SMTP_PORT || "",
        DEFAULT_EMAIL_FROM: "NoReply <no-reply@website.com>",
        SMTP_PASSWORD: process.env.MAILER_SMTP_PASSWORD || "",
        SECURE: process.env.MAILER_SECURE === "true" ? true : false,
        SMTP_HOST: process.env.MAILER_SMTP_HOST || "smtp.ethereal.email"
    },
    AWS: {
        S3_BUCKET: process.env.AWS_S3_BUCKET || "",
        ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
        SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || ""
    },
    CORS_SETTINGS: {
        credentials: true,
        exposedHeaders: ["set-cookie"],
        origin: process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(",") : ["http://localhost:3000"]
    }
};

// Uncomment this line to see the configs
// console.log(CONFIGS);

export { CONFIGS };
