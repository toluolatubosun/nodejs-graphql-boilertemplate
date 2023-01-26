import { IUser } from "../models/user.model";

export interface Context {
    user: IUser | null;
}
