import JWT from "jsonwebtoken";

import { JWT_SECRET } from "../../config";
import User from "../../models/user.model";

export default async (authorization: string | undefined) => {
    if (!authorization) return null;

    const authToken = authorization.split(" ")[1];
    const decoded = JWT.verify(authToken, JWT_SECRET) as any;

    const user = await User.findOne({ _id: decoded.id });

    return user;
};
