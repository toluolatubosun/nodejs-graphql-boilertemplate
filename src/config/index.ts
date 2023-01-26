export const PORT = process.env.PORT || 8000;
export const APP_NAME = "my-apollo-server-express-starter";
export const NODE_ENV = process.env.NODE_ENV || "development";
export const CLOUDINARY_URL = process.env.CLOUDINARY_URL || "";
export const BCRYPT_SALT = Number(process.env.BCRYPT_SALT) || 10;
export const JWT_SECRET = process.env.JWT_SECRET || "my-apollo-server-express-starter";
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/my-apollo-server-express-starter";
export const URL = {
    BASE_URL: process.env.BASE_URL || `http://localhost:${PORT}`,
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000"
};
export const ROLE = {
    ADMIN: ["admin"],
    USER: ["user", "admin"]
};
export const MAILER = {
    USER: process.env.MAILER_USER || "",
    PORT: process.env.MAILER_PORT || 465,
    SECURE: process.env.MAILER_SECURE || false,
    PASSWORD: process.env.MAILER_PASSWORD || "",
    HOST: process.env.MAILER_HOST || "smtp.gmail.com",
    DOMAIN: process.env.MAILER_DOMAIN || "@my-apollo-server-express-starter.com"
};
