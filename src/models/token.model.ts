import mongoose from "mongoose";

export interface IToken extends mongoose.Document {
    userId: string;
    token: string;
    type: "password-reset" | "email-verification" | "refresh-token";
    expiresAt: Date;
}

const tokenSchema: mongoose.Schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    token: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ["password-reset", "email-verification", "refresh-token"]
    },
    expiresAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 60 // 1 minutes grace period
    }
});

export default mongoose.model<IToken>("token", tokenSchema);
