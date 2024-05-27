import * as Sentry from "@sentry/node";

import type { GraphQLRequestContext } from "@apollo/server";
import type { Context, WithRequired } from "@/@types/graphql";

export const sentryGraphQLConfig = {
    async requestDidStart(_: GraphQLRequestContext<Context>) {
        return {
            async didEncounterErrors(requestContext: WithRequired<GraphQLRequestContext<Context>, "errors">) {
                // If we couldn't parse the operation (usually invalid queries)
                if (!requestContext.operation) {
                    for (const err of requestContext.errors) {
                        Sentry.withScope((scope) => {
                            scope.setExtra("query", requestContext.request.query);
                            Sentry.captureException(err);
                        });
                    }
                    return;
                }

                for (const err of requestContext.errors) {
                    // Add scoped report details and send to Sentry
                    Sentry.withScope((scope) => {
                        // Annotate whether failing operation was query/mutation/subscription
                        scope.setTag("kind", requestContext.operation?.operation || "unknown");

                        // Log query and variables as extras (make sure to strip out sensitive data!)
                        scope.setExtra("query", requestContext.request.query);
                        scope.setExtra("variables", requestContext.request.variables);

                        if (err.path) {
                            // We can also add the path as breadcrumb
                            scope.addBreadcrumb({
                                level: "debug",
                                category: "query-path",
                                message: err.path.join(" > "),
                            });
                        }

                        Sentry.captureException(err);
                    });
                }
            },
        };
    },
};
