import { CONFIGS } from "@/configs";
import UserService from "@/services/user.service";
import guard from "@/middlewares/graphql/guard.middleware";

import type { IUser } from "@/models/user.model";

export default {
    me: async (_: any, __: any, context: Context): Promise<IUser> => {
        const user = guard(context.user, CONFIGS.APP_ROLES.USER);
        return await UserService.getOne(user.id);
    },
    user: async (_: any, { userId }: { userId: string }, context: Context): Promise<IUser> => {
        guard(context.user, CONFIGS.ADMIN_ROLES.SUPER_ADMIN);
        return await UserService.getOne(userId);
    },
    users: async (_: any, { pagination }: { pagination: PaginationInput }, context: Context): Promise<{ users: IUser[]; pagination: PaginationPayload }> => {
        guard(context.user, CONFIGS.ADMIN_ROLES.SUPER_ADMIN);
        return await UserService.getAll(pagination);
    },
};
