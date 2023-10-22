import cors from "cors";
import express from "express";
import depthLimit from "graphql-depth-limit";
import { ApolloServer } from "@apollo/server";
import { readFile, readdir } from "fs/promises";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from "@apollo/server/plugin/landingPage/default";

import { CONFIGS } from "@/configs";
import resolvers from "@/graphql/resolvers";
import auth from "@/middlewares/graphql/auth.middleware";
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
    const server = new ApolloServer({
        schema,
        formatError: handleError,
        validationRules: [depthLimit(10)],
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            CONFIGS.NODE_ENV === "production"
                ? ApolloServerPluginLandingPageProductionDefault({ graphRef: "my-graph-id@my-graph-variant", footer: false })
                : ApolloServerPluginLandingPageLocalDefault({ footer: false })
        ]
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
                    user
                };
            }
        })
    );

    await new Promise<void>((resolve) => httpServer.listen({ port: CONFIGS.PORT as number }, resolve));

    console.log(`:::> 🚀 GQL Server ready at http://localhost:${CONFIGS.PORT}/graphql`);

    return server;
};
