import { CONFIGS } from "@/configs";
import UserService from "@/services/user.service";
import guard from "@/middlewares/graphql/guard.middleware";

import type { IUser } from "@/models/user.model";

export default {
    userCreate: async (_: any, { input }: { input: Object }, context: Context): Promise<IUser> => {
        guard(context.user, CONFIGS.ADMIN_ROLES.SUPER_ADMIN);
        return await UserService.create(input);
    },
    userUpdateMe: async (_: any, { input }: { input: Object }, context: Context): Promise<IUser> => {
        const user = guard(context.user, CONFIGS.APP_ROLES.USER);
        return await UserService.update(user.id, input);
    },
    userUpdate: async (_: any, { userId, input }: { userId: string; input: Object }, context: Context): Promise<IUser> => {
        guard(context.user, CONFIGS.ADMIN_ROLES.SUPER_ADMIN);
        return await UserService.update(userId, input);
    },
    userDelete: async (_: any, { userId }: { userId: string }, context: Context): Promise<IUser> => {
        guard(context.user, CONFIGS.ADMIN_ROLES.SUPER_ADMIN);
        return await UserService.delete(userId);
    },
    userDemoNotification: async (_: any, __: any, context: Context): Promise<boolean> => {
        const user = guard(context.user, CONFIGS.APP_ROLES.USER);

        context.PubSub.publish(CONFIGS.GRAPHQL_SUBSCRIPTION_TOPIC.USER_NOTIFICATION, {
            userId: String(user._id),
            userNotification: { title: "Demo Notification", body: "This is a dummy notification to test subscriptions" },
        });

        return true;
    },
};
