import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    image: string | null;
    role: "user" | "super_admin";
    emailVerified: boolean;
    accountDisabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: mongoose.Schema<IUser> = new mongoose.Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: false,
            default: null,
        },
        role: {
            type: String,
            required: true,
            trim: true,
            enum: ["user", "super_admin"],
            default: "user",
        },
        accountDisabled: {
            type: Boolean,
            required: true,
            default: false,
        },
        emailVerified: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.plugin(paginate);

export default mongoose.model<IUser, mongoose.PaginateModel<IUser>>("users", userSchema);
