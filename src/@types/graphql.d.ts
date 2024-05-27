import type { Response, Request } from "express";
import type { IUser } from "../models/user.model";

export interface Context {
    req: Request;
    res: Response;
    user: IUser | null;
}

export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
