import routes from "@/rest/routes";
import { CONFIGS } from "@/configs";
import CustomError from "@/utilities/rest/custom-error";
import errorMiddleware from "@/middlewares/rest/error.middleware";

import type { Application } from "express";

export default (app: Application) => {
    app.get("/", (_, res) => {
        res.send(`Hello World, from ${CONFIGS.APP_NAME}!`);
    });

    app.get("/error", () => {
        throw new CustomError("Test Error", 500);
    });

    app.use(routes);

    console.log(`:::> 🚀 Rest Server ready at http://localhost:${CONFIGS.PORT}`);

    errorMiddleware(app);
};
