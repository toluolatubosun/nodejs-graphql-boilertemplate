import { ZodError } from "zod";

export const extractZodError = (error: ZodError<any>) => {
    // TODO :: Comment this
    console.log("error", error);

    const formattedError = new Set<{ message: string }>();

    for (const singleError of error.errors) {
        switch (singleError.code) {
            case "invalid_type": {
                if (singleError.message.includes("Expected")) {
                    // to catch invalid type
                    formattedError.add({ message: `${singleError.path.join(".")} ${singleError.message.toLowerCase()}` });
                } else if (singleError.message === "Required") {
                    // to catch objects that are required
                    formattedError.add({ message: `${singleError.path.join(".")} is required` });
                } else {
                    formattedError.add({ message: `${singleError.message}` });
                }
                break;
            }

            case "invalid_enum_value": {
                if (singleError.message.includes("Expected")) {
                    // messsage -- Expected 'option1', 'option2', 'option3' but got 'option4'
                    formattedError.add({ message: `${singleError.path.join(".")} is invalid. ${singleError.message.substring(20)}` });
                } else {
                    formattedError.add({ message: `${singleError.message}` });
                }

                break;
            }

            default: {
                formattedError.add({ message: `${singleError.message}` });
                break;
            }
        }
    }

    // return first error message
    return formattedError.values().next().value?.message || "a validation error occurred";
};

/**
 * Parse cookies from websocket handshake, used for GraphQL subscriptions
 *
 * sample input
 * __access=smdejnfkejnf; __refresh=smdejnfkejnf;
 *
 * sample output
 * {
 *    __access: "smdejnfkejnf",
 *   __refresh: "smdejnfkejnf"
 * }
 *
 * @param cookie
 * @returns
 */
export const parseWSCookies = (cookie: string | undefined) => {
    const jsonObject: Record<string, string> = {};

    if (!cookie) return jsonObject;

    const cookies = cookie.split(";").map((cookie: string) => cookie.trim().split("="));
    for (const item of cookies) {
        (jsonObject as any)[item[0]!] = item[1];
    }

    return jsonObject;
};
