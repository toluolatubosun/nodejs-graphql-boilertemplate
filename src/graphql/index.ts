import depthLimit from "graphql-depth-limit";
import { ApolloServer } from "apollo-server-express";
import {
    ApolloServerPluginDrainHttpServer,
    ApolloServerPluginLandingPageDisabled,
    ApolloServerPluginLandingPageLocalDefault
} from "apollo-server-core";

import typeDefs from "./schema";
import resolvers from "./resolvers";

import { NODE_ENV } from "../config";
import auth from "../middlewares/graphql/auth.middleware";

import type { Server } from "http";
import type { Application } from "express";

export default async (app: Application, httpServer: Server) => {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        validationRules: [depthLimit(10)],
        debug: NODE_ENV === "production" ? false : true,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            NODE_ENV === "production" ? ApolloServerPluginLandingPageDisabled() : ApolloServerPluginLandingPageLocalDefault({ embed: true })
        ],
        context: async ({ req, res }) => {
            const user = await auth(req.headers.authorization);

            return {
                user
            };
        }
    });

    await server.start();

    server.applyMiddleware({ app, path: "/graphql", cors: false });

    return server;
};
