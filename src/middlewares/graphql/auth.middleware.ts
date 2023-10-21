import JWT from "jsonwebtoken";
import { CONFIGS } from "@/configs";
import User, { IUser } from "@/models/user.model";

export default async ({ authorization, cookieToken }: { authorization?: string; cookieToken?: string }) => {
    if (!authorization && !cookieToken) return null;

    const token = authorization ? authorization.split(" ")[1] : "";

    let decoded = null;
    let user: IUser | null = null;

    const verifyToken = async (token: string) => {
        decoded = JWT.verify(token, CONFIGS.JWT_SECRET) as { id: string; role: string };
        user = await User.findOne({ _id: decoded.id });
    };

    try {
        // Verify token from Authorization Header
        if (token) {
            await verifyToken(token);
        }

        // Verify token from Cookie
        if (user === null && cookieToken) {
            await verifyToken(cookieToken);
        }
    } catch (err) {}

    return user as IUser | null;
};
