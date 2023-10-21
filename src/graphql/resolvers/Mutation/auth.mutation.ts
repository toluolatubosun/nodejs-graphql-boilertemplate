import { CONFIGS } from "@/configs";
import AuthService from "@/services/auth.service";
import guard from "@/middlewares/graphql/guard.middleware";
import { BASE_COOKIE_OPTIONS } from "@/configs/web-cookies";

import type { Context } from "@/@types/graphql";
import type { IUser } from "@/models/user.model";

export default {
    authLogin: async (_: any, { input }: AuthLoginArgs, context: Context): Promise<{ user: IUser; token: AuthToken }> => {
        const result = await AuthService.login(input);
        context.res.cookie("__access", result.token.accessToken, { ...BASE_COOKIE_OPTIONS, maxAge: CONFIGS.ACCESS_TOKEN_JWT_EXPIRES_MS });
        context.res.cookie("__refresh", result.token.refreshToken, { ...BASE_COOKIE_OPTIONS, maxAge: CONFIGS.REFRESH_TOKEN_JWT_EXPIRES_MS });
        return result;
    },
    authRegister: async (_: any, { input }: AuthRegisterArgs, context: Context): Promise<{ user: IUser; token: AuthToken }> => {
        const result = await AuthService.register(input);
        context.res.cookie("__access", result.token.accessToken, { ...BASE_COOKIE_OPTIONS, maxAge: CONFIGS.ACCESS_TOKEN_JWT_EXPIRES_MS });
        context.res.cookie("__refresh", result.token.refreshToken, { ...BASE_COOKIE_OPTIONS, maxAge: CONFIGS.REFRESH_TOKEN_JWT_EXPIRES_MS });
        return result;
    },
    authLogout: async (_: any, { refreshToken }: AuthLogoutArgs, context: Context): Promise<boolean> => {
        const token = (refreshToken || context.req.cookies.__refresh) as string;
        const result = await AuthService.logout(token);

        context.res.cookie("__access", "", { ...BASE_COOKIE_OPTIONS, maxAge: 0 });
        context.res.cookie("__refresh", "", { ...BASE_COOKIE_OPTIONS, maxAge: 0 });
        return result;
    },
    authVerifyEmail: async (_: any, { userId, verificationToken }: AuthVerifyEmailArgs, __: Context): Promise<boolean> => {
        return await AuthService.verifyEmail({ userId, verificationToken });
    },
    authRequestPasswordReset: async (_: any, { email }: AuthRequestPasswordResetArgs, __: Context): Promise<boolean> => {
        return await AuthService.requestPasswordReset(email);
    },
    authRefreshAccessToken: async (_: any, { refreshToken }: AuthRefreshAccessTokenArgs, context: Context): Promise<string> => {
        const token = (refreshToken || context.req.cookies.__refresh) as string;
        const result = await AuthService.refreshAccessToken(token);

        context.res.cookie("__access", result, { ...BASE_COOKIE_OPTIONS, maxAge: CONFIGS.ACCESS_TOKEN_JWT_EXPIRES_MS });
        return result;
    },
    authUpdatePassword: async (_: any, { oldPassword, newPassword }: AuthUpdatePasswordArgs, context: Context): Promise<boolean> => {
        const user = guard(context.user, CONFIGS.ROLES.USER);
        return await AuthService.updatePassword(user.id, { oldPassword, newPassword });
    },
    authRequestEmailVerification: async (_: any, { email }: AuthRequestEmailVerificationArgs, __: Context): Promise<boolean> => {
        return await AuthService.requestEmailVerification(email);
    },
    authResetPassword: async (_: any, { userId, resetToken, password }: AuthResetPasswordArgs, __: Context): Promise<boolean> => {
        return await AuthService.resetPassword({ userId, resetToken, password });
    }
};
