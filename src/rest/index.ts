import routes from "./routes";
import CustomError from "../utils/rest/custom-error";
import errorMiddleware from "../middlewares/rest/error.middleware";

import type { Application } from "express";

export default (app: Application) => {
    app.get("/", (req, res) => {
        res.send("Hello World!");
    });

    app.get("/error", (req, res) => {
        throw new CustomError("Custom Error", 500);
    });

    app.use(routes);

    errorMiddleware(app);
};
