import routes from "./routes";
import { PORT } from "../config";
import CustomError from "../utils/rest/custom-error";
import errorMiddleware from "../middlewares/rest/error.middleware";

import type { Application } from "express";

export default (app: Application) => {
    app.get("/", (req, res) => {
        res.send("Hello World!");
    });

    app.get("/error", (req, res) => {
        throw new CustomError("Test Error", 500);
    });

    app.use(routes);

    console.log(`:::> 🚀 Rest Server ready at http://localhost:${PORT}`);

    errorMiddleware(app);
};
