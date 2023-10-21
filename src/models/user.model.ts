import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { CONFIGS } from "../configs";

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    image: string;
    role: "user" | "admin";
    emailVerified: boolean;
    accountDisabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: mongoose.Schema = new mongoose.Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: false
        },
        role: {
            type: String,
            required: true,
            trim: true,
            enum: ["user", "admin"],
            default: "user"
        },
        accountDisabled: {
            type: Boolean,
            required: true,
            default: true
        },
        emailVerified: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const hash = await bcrypt.hash(this.password, CONFIGS.BCRYPT_SALT);
    this.password = hash;

    next();
});

export default mongoose.model<IUser>("user", userSchema);
