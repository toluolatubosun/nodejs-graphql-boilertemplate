import { CONFIGS } from ".";
import type { CookieOptions } from "express";

export const BASE_COOKIE_OPTIONS: CookieOptions = {
    path: "/",
    httpOnly: true,
    secure: CONFIGS.NODE_ENV !== "development",
    sameSite: CONFIGS.NODE_ENV !== "development" ? "none" : false,
    domain: CONFIGS.URL.CLIENT_BASE_URL.replace(/(^\w+:|^)\/\//, "").split(/\/|:/)[0] // remove protocol and split at / or : to get the domain
};

// Uncomment to see the cookie options
// console.log(BASE_COOKIE_OPTIONS);
