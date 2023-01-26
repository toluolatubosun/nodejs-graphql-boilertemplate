import { ROLE } from "../../config";
import CustomError from "../../utils/graphql/custom-error";

import type { IUser } from "../../models/user.model";

export default (user: IUser | null, roles?: string[]) => {
    if (!user) throw new CustomError("Unauthorized: Please login to continue");
    if (!user.isActive) throw new CustomError("Unauthorized: User has been deactivated");
    if (!user.isVerified) throw new CustomError("Unauthorized: Please verify email address");

    if (!roles) roles = ROLE.USER;
    if (!roles.includes(user.role)) throw new CustomError("unauthorized access");

    return user;
};
