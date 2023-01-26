import { ROLE } from "../../../config";
import UserService from "../../../services/user.service";
import guard from "../../../middlewares/graphql/guard.middleware";

import type { Context } from "../../../types/graphql";
import type { IUser } from "../../../models/user.model";

export default {
    me: async (_: any, __: any, context: Context): Promise<IUser> => {
        const user = guard(context.user, ROLE.USER);
        return await UserService.getOne(user.id);
    },
    user: async (_: any, { userId }: UserArgs, context: Context): Promise<IUser> => {
        guard(context.user, ROLE.ADMIN);
        return await UserService.getOne(userId);
    },
    users: async (_: any, { pagination }: UsersArgs, context: Context): Promise<{ users: IUser[]; pagination: PaginationPayload }> => {
        guard(context.user, ROLE.ADMIN);
        return await UserService.getAll(pagination);
    }
};
