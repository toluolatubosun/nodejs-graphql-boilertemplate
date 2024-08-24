import cors from "cors";
import express from "express";
import { WebSocketServer } from "ws";
import depthLimit from "graphql-depth-limit";
import { ApolloServer } from "@apollo/server";
import { readFile, readdir } from "fs/promises";
import { useServer } from "graphql-ws/lib/use/ws";
import { sentryGraphQLConfig } from "@/libraries/sentry";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from "@apollo/server/plugin/landingPage/default";

import resolvers from "@/graphql/resolvers";
import { CONFIGS, DEPLOYMENT_ENV } from "@/configs";
import auth from "@/middlewares/graphql/auth.middleware";
import { parseWSCookies } from "@/utilities/helpful-methods";
import { handleError } from "@/utilities/graphql/custom-error";

import type { Server } from "http";
import type { Application } from "express";

export default async (app: Application, httpServer: Server) => {
    let typeDefs = await readFile(`${__dirname}/schema/schema.graphql`, "utf-8");
    const files = await readdir(`${__dirname}/schema/data`);
    for (const file of files) {
        typeDefs += await readFile(`${__dirname}/schema/data/${file}`, "utf-8");
    }

    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const PubSubClient = new RedisPubSub({ connection: CONFIGS.REDIS_URI });
    const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" });
    const serverCleanup = useServer(
        {
            schema,
            onConnect: async ({ connectionParams, extra: { request } }) => {
                const cookies = parseWSCookies(request.headers.cookie);
                const user = await auth({ authorization: connectionParams?.authorization as string, cookieToken: cookies.__access });
                if (user) {
                    // await UserService.setOnline(user.id);
                }
            },
            onDisconnect: async ({ connectionParams, extra: { request } }) => {
                const cookies = parseWSCookies(request.headers.cookie);
                const user = await auth({ authorization: connectionParams?.authorization as string, cookieToken: cookies.__access });
                if (user) {
                    // await UserService.setOffline(user.id);
                }
            },
            context: async ({ connectionParams, extra: { request } }) => {
                const cookies = parseWSCookies(request.headers.cookie);
                const user = await auth({ authorization: connectionParams?.authorization as string, cookieToken: cookies.__access });
                return {
                    user: user,
                    PubSub: PubSubClient,
                };
            },
        },
        wsServer
    );

    const server = new ApolloServer({
        schema,
        formatError: handleError,
        validationRules: [depthLimit(10)],
        plugins: [
            sentryGraphQLConfig,
            ApolloServerPluginDrainHttpServer({ httpServer }),
            DEPLOYMENT_ENV === "production" ? ApolloServerPluginLandingPageProductionDefault({ graphRef: "my-graph-id@my-graph-variant", footer: false }) : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        },
                    };
                },
            },
        ],
    });

    await server.start();

    app.use(
        "/graphql",
        express.json(),
        cors<cors.CorsRequest>(CONFIGS.CORS_SETTINGS),
        expressMiddleware(server, {
            context: async ({ req, res }: any) => {
                const user = await auth({ authorization: req.headers.authorization, cookieToken: req.cookies.__access });
                return {
                    req,
                    res,
                    user,
                    PubSub: PubSubClient,
                };
            },
        })
    );

    await new Promise<void>((resolve) => httpServer.listen({ port: CONFIGS.PORT as number }, resolve));

    console.log(`:::> 🚀 GQL Server ready at http://localhost:${CONFIGS.PORT}/graphql`);

    return server;
};
