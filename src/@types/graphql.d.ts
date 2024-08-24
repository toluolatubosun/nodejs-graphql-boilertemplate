import type { Response, Request } from "express";
import type { IUser } from "@/models/user.model";
import type { RedisPubSub } from "graphql-redis-subscriptions";

declare global {
    export interface Context {
        req: Request;
        res: Response;
        user: IUser | null;
        PubSub: RedisPubSub;
    }

    export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
}
