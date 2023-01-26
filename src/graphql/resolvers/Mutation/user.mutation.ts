import { ROLE } from "../../../config";
import UserService from "../../../services/user.service";
import guard from "../../../middlewares/graphql/guard.middleware";

import type { Context } from "../../../types/graphql";
import type { IUser } from "../../../models/user.model";

export default {
    userCreate: async (_: any, { input }: UserDataArgs, context: Context): Promise<IUser> => {
        guard(context.user, ROLE.ADMIN);
        return await UserService.create(input);
    },
    userUpdateMe: async (_: any, { input }: UserDataArgs, context: Context): Promise<IUser> => {
        const user = guard(context.user, ROLE.USER);
        return await UserService.update(user.id, input);
    },
    userUpdate: async (_: any, { userId, input }: UserUpdateArgs, context: Context): Promise<IUser> => {
        const user = guard(context.user, ROLE.ADMIN);
        return await UserService.update(userId, input, user.role);
    },
    userDelete: async (_: any, { userId }: UserDeleteArgs, context: Context): Promise<IUser> => {
        guard(context.user, ROLE.ADMIN);
        return await UserService.delete(userId);
    }
};
