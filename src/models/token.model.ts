import { CONFIGS } from "@/configs";
import mongoose from "mongoose";

export const TOKEN_TYPES = {
    REFRESH_TOKEN: "refresh-token",
    PASSWORD_RESET: "password-reset",
    EMAIL_VERIFICATION: "email-verification",
} as const;

export interface IToken extends mongoose.Document {
    code: string | null;
    token: string | null;
    type: (typeof TOKEN_TYPES)[keyof typeof TOKEN_TYPES];
    userId: mongoose.Types.ObjectId;
    expiresAt: Date;
}

const tokenSchema: mongoose.Schema = new mongoose.Schema({
    code: {
        type: String,
        required: false,
        default: null,
    },

    token: {
        type: String,
        required: false,
        default: null,
    },

    type: {
        type: String,
        required: true,
        enum: Object.values(TOKEN_TYPES),
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "users",
    },

    expiresAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: CONFIGS.DEFAULT_DB_TOKEN_EXPIRY_DURATION,
    },
});

export default mongoose.model<IToken>("tokens", tokenSchema);
