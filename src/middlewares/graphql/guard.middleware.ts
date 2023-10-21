import { CONFIGS } from "@/configs";
import CustomError from "@/utilities/graphql/custom-error";

import type { IUser } from "@/models/user.model";

export default (user: IUser | null, roles?: string[]) => {
    if (!user) throw new CustomError("Unauthorized: Please login to continue", "NOT_AUTHENTICATED");
    if (!user.accountDisabled) throw new CustomError("Unauthorized: User has been deactivated", "ACCOUNT_DISABLED");
    if (!user.emailVerified) throw new CustomError("Unauthorized: Please verify email address", "EMAIL_NOT_VERIFIED");

    if (!roles) roles = CONFIGS.ROLES.USER;
    if (!roles.includes(user.role)) throw new CustomError("unauthorized access", "UNAUTHORIZED");

    return user;
};
