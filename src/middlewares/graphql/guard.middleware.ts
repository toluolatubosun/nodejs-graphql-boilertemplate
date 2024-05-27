import { CONFIGS } from "@/configs";
import CustomError from "@/utilities/graphql/custom-error";

import type { IUser } from "@/models/user.model";

export default (user: IUser | null, roles?: string[]) => {
    if (!user) throw new CustomError("Unauthorized: Please login to continue", "-middleware/unauthorized-no-user");
    if (user.accountDisabled) throw new CustomError("Unauthorized: User has been deactivated", "-middleware/unauthorized-account-disabled");
    if (!user.emailVerified) throw new CustomError("Unauthorized: Please verify email address", "-middleware/unauthorized-email-not-verified");

    if (!roles) roles = CONFIGS.APP_ROLES.USER;
    if (!roles.includes(user.role)) throw new CustomError("unauthorized access", "-middleware/unauthorized-role-not-allowed");

    return user;
};
