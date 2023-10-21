import "express-async-errors";
import http from "http";
import express from "express";

import { connectMongoDB } from "@/libraries/mongo";
import { applyCoreMiddleware } from "@/middlewares/core.middleware";

import restServer from "@/rest";
import graphqlServer from "@/graphql";

const app = express();
const httpServer = http.createServer(app);

connectMongoDB();
applyCoreMiddleware(app);

restServer(app);
graphqlServer(app, httpServer);

// On server error
app.on("error", (error) => {
    console.error(`<::: An error occurred on the server: \n ${error}`);
});

export default app;
