import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import express from "express";
import cookieParser from "cookie-parser";

import { CONFIGS } from "@/configs";

import type { Express } from "express";

const applyCoreMiddleware = (app: Express): Express => {
    // Enable CORS
    app.use(cors(CONFIGS.CORS_SETTINGS));

    // Secure the app by setting various HTTP headers off.
    app.use(helmet({ contentSecurityPolicy: false }));

    // Logger, enable only in development
    app.use(morgan("common", { skip: () => CONFIGS.NODE_ENV !== "development" }));

    // Cookie Parser
    app.use(cookieParser() as any);

    // Tell express to recognize the incoming Request Object as a JSON Object
    app.use(express.json());

    // app.use("/public", express.static(path.join(__dirname, "..", "..", "public")));

    // Express body parser
    app.use(express.urlencoded({ extended: true }));

    return app;
};

export { applyCoreMiddleware };
