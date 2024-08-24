import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import express from "express";
import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

import { CONFIGS, DEPLOYMENT_ENV } from "@/configs";

import type { Express } from "express";

const applyCoreMiddleware = (app: Express): Express => {
    // Set Proxy
    app.set("trust proxy", true);

    // Initialize Sentry
    Sentry.init({
        dsn: CONFIGS.SENTRY.DSN,
        environment: DEPLOYMENT_ENV,
        release: CONFIGS.SENTRY.RELEASE,

        integrations: [
            // enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),

            // enable Express.js middleware tracing
            new Sentry.Integrations.Express({ app }),

            // Automatically instrument Node.js libraries and frameworks
            ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),

            // enable profiling
            nodeProfilingIntegration(),
        ],

        tracesSampleRate: 0.4, // % of transactions that will be sampled
        profilesSampleRate: 0.4, // % of transactions that will be profiled
    });

    // Sentry request handler of transactions for performance monitoring.
    app.use(Sentry.Handlers.requestHandler());

    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());

    // Enable CORS
    app.use(
        cors({
            credentials: true,
            exposedHeaders: ["set-cookie"],
            origin: [...CONFIGS.CORS_ALLOWED_ORIGINS],
        })
    );

    // Secure the app by setting various HTTP headers off.
    app.use(helmet({ contentSecurityPolicy: false }));

    // Logger, enable only in development
    app.use(morgan("common", { skip: () => DEPLOYMENT_ENV !== "development" }));

    // Cookie Parser
    app.use(cookieParser() as any);

    // Tell express to recognize the incoming Request Object as a JSON Object
    app.use(express.json());

    app.use("/public", express.static(path.join(__dirname, "..", "..", "public")));

    // Express body parser
    app.use(express.urlencoded({ extended: true }));

    return app;
};

export { applyCoreMiddleware };
