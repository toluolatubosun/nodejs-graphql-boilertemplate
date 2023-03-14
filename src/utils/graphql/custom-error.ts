import { GraphQLFormattedError, GraphQLError } from "graphql";

class CustomError extends GraphQLError {
    constructor(message: string, code = "CUSTOM_ERROR") {
        super(message, { extensions: { code } });
        Object.defineProperty(this, "name", { value: "CustomError" });
    }
}

export default CustomError;

export const handleError = (formattedError: GraphQLFormattedError, error: unknown) => {
    if (formattedError.message.startsWith("Database Error: ")) {
        return { message: "Internal server error" };
    }

    if (error instanceof CustomError) {
        return { message: error.message };
    }

    return formattedError;
};
