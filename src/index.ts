import "express-async-errors";
import http from "http";
import express from "express";

const app = express();
const httpServer = http.createServer(app);

import core from "./middlewares/core.middleware";
core(app);

import "./database/mongo";

import restServer from "./rest";
import graphqlServer from "./graphql";

restServer(app);
graphqlServer(app, httpServer);

import { PORT } from "./config";

httpServer.listen(PORT, () => {
    console.log(`:::> Server ready at http://localhost:${PORT}/graphql`);
});

// On server error
app.on("error", (error) => {
    console.error(`<::: An error occurred on the server: \n ${error}`);
});

export default app;
