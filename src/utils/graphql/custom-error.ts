import { ApolloError } from "apollo-server-errors";

export default class CustomError extends ApolloError {
    constructor(message: string, code = "CUSTOM_ERROR") {
        super(message, code);

        Object.defineProperty(this, "name", { value: "CustomError" });
    }
}
