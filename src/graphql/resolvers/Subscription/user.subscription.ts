import { withFilter } from "graphql-subscriptions";

import { CONFIGS } from "@/configs";
import guard from "@/middlewares/graphql/guard.middleware";

export default {
    userNotification: {
        subscribe: async (_: any, __: any, context: Context) => {
            const user = guard(context.user, CONFIGS.APP_ROLES.USER);

            return withFilter(
                () => context.PubSub.asyncIterator([CONFIGS.GRAPHQL_SUBSCRIPTION_TOPIC.USER_NOTIFICATION]),
                (payload: { userId: string }, args: { userId: string }) => {
                    // Check if the user owns the notification
                    return payload.userId === args.userId;
                }
            )(_, { userId: user.id });
        },
    },
};
