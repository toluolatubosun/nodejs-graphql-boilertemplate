import ms from "ms";
import dotenv from "dotenv";
import packageInfo from "../../package.json";
import type { CookieOptions } from "express";

dotenv.config();

// How to use this:
// ============================================================
// This file is used to store all the environment variables and constants used in the application.

// # To add a new variable:
// ============================================================
// - For environment variables & constants that are the same across all environments, add them to the GLOBAL_CONSTANTS object.
// - For environment-specific variables (i.e they change depending on the environment), add them to the environment's object in each of the CONFIG_BUILDER object.

// # To add a new environment:
// ============================================================
// 1. Add a new key to the CONFIG_BUILDER object with the environment name.
// 2. Duplicate the development object and replace the values with the new environment's values.

const APP_VERSION = packageInfo.version;
const DEPLOYMENT_ENV = process.env.NODE_ENV || "development";

const GLOBAL_CONSTANTS = {
    // System Constants
    // ============================================================
    PORT: process.env.PORT || 4000,
    APP_NAME: "nodejs-graphql-boilertemplate",
    SUPPORT_EMAIL: "support@nodejs-graphql-boilertemplate.com",
    DEFAULT_EMAIL_FROM: "nodejs-graphql-boilertemplate <no-reply@nodejs-graphql-boilertemplate.com>",

    // Server Constants
    // ============================================================
    SERVER_BACKEND_TEAM_EMAILS: [], // TODO: Add alerts notification emails here

    // Security / Auth Configs
    // ============================================================
    BCRYPT_SALT: 10,
    ACCESS_TOKEN_JWT_EXPIRES_IN: ms("1h"),
    REFRESH_TOKEN_JWT_EXPIRES_IN: ms("30d"),
    DEFAULT_DB_TOKEN_EXPIRY_DURATION: ms("15m"),

    // Sentry & Monitoring Configs
    // ============================================================
    SENTRY: {
        RELEASE: APP_VERSION,
        DSN: "", // TODO: Add Sentry DSN here
    },

    // App Level Configs
    // ============================================================
    APP_ROLES: {
        USER: ["user"],
    },

    ADMIN_ROLES: {
        SUPER_ADMIN: ["super_admin"],
    },

    GRAPHQL_SUBSCRIPTION_TOPIC: {
        USER_NOTIFICATION: "USER_NOTIFICATION",
    },

    MAILER: {
        SMTP_HOST: process.env.MAILER_SMTP_HOST,
        SMTP_PORT: process.env.MAILER_SMTP_PORT,
        SMTP_USER: process.env.MAILER_SMTP_USER,
        SMTP_PASSWORD: process.env.MAILER_SMTP_PASSWORD,
        SECURE: process.env.MAILER_SECURE === "true" ? true : false,
        USE_AWS_SES: process.env.MAILER_USE_AWS_SES === "true" ? true : false,
    },

    AWS: {
        S3_BUCKET: process.env.AWS_S3_BUCKET,
        ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    },

    CLOUDINARY: {
        URL: process.env.CLOUDINARY_URL,
    },
};

const CONFIG_BUILDER = {
    development: {
        ...GLOBAL_CONSTANTS,

        // System Constants
        // ============================================================
        URL: {
            API_BASE_URL: "https://localhost:4000",
            AUTH_BASE_URL: "https://localhost:3000",
            LANDING_BASE_URL: "https://localhost:3000",
        },

        // Security / Auth Configs
        // ============================================================
        JWT_SECRET: "T4u2Rcnne09F.FBr11f0VvERyUiq",

        // DB Constants
        // ============================================================
        REDIS_URI: "redis://127.0.0.1:6379",
        MONGODB_URI: "mongodb://127.0.0.1:27017/nodejs-graphql-boilertemplate",

        // App Level Configs
        // ============================================================
        CORS_ALLOWED_ORIGINS: ["http://localhost:3000"],

        // e.g
        // STRIPE: {
        //     PUBLIC_KEY: "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        //     SECRET_KEY: "sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        // },
    },

    production: {
        ...GLOBAL_CONSTANTS,

        // System Constants
        // ============================================================
        URL: {
            AUTH_BASE_URL: "https://nodejs-boilertemplate.com",
            LANDING_BASE_URL: "https://nodejs-boilertemplate.com",
            API_BASE_URL: "https://api.nodejs-boilertemplate.com",
        },

        // Security / Auth Configs
        // ============================================================
        JWT_SECRET: process.env.JWT_SECRET!,

        // DB Constants
        // ============================================================
        REDIS_URI: process.env.REDIS_URI!,
        MONGODB_URI: process.env.MONGO_ATLAS_URI!,

        // App Level Configs
        // ============================================================
        CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(",") : [],

        // e.g
        // STRIPE: {
        //     PUBLIC_KEY: "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        //     SECRET_KEY: "sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        // },
    },
} as const;

// Check if DEPLOYMENT_ENV is valid
if (!Object.keys(CONFIG_BUILDER).includes(DEPLOYMENT_ENV)) {
    throw new Error(`Invalid NODE_ENV: ${DEPLOYMENT_ENV}`);
}

const CONFIGS = CONFIG_BUILDER[DEPLOYMENT_ENV as keyof typeof CONFIG_BUILDER];

// Uncomment below to check configs set
// console.log("CONFIGS:", CONFIGS);

const WEB_COOKIE_OPTIONS: CookieOptions = {
    path: "/",
    httpOnly: true,
    secure: DEPLOYMENT_ENV !== "development",
    sameSite: DEPLOYMENT_ENV !== "development" ? "none" : false,
    domain: CONFIGS.URL.LANDING_BASE_URL.replace(/(^\w+:|^)\/\//, "").split(/\/|:/)[0], // remove protocol and split at / or : to get the domain
} as const;

export { WEB_COOKIE_OPTIONS, DEPLOYMENT_ENV, APP_VERSION, CONFIGS };
