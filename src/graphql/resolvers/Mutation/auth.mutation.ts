import AuthService from "@/services/auth.service";
import { CONFIGS, WEB_COOKIE_OPTIONS } from "@/configs";
import guard from "@/middlewares/graphql/guard.middleware";

import type { IUser } from "@/models/user.model";

export default {
    authLogin: async (_: any, { input }: { input: Object }, context: Context): Promise<{ user: IUser; token: AuthToken }> => {
        const result = await AuthService.login(input);
        context.res.cookie("__access", result.token.accessToken, { ...WEB_COOKIE_OPTIONS, maxAge: CONFIGS.ACCESS_TOKEN_JWT_EXPIRES_IN });
        context.res.cookie("__refresh", result.token.refreshToken, { ...WEB_COOKIE_OPTIONS, maxAge: CONFIGS.REFRESH_TOKEN_JWT_EXPIRES_IN });
        return result;
    },
    authRegister: async (_: any, { input }: { input: Object }, context: Context): Promise<{ user: IUser; token: AuthToken }> => {
        const result = await AuthService.register(input);
        context.res.cookie("__access", result.token.accessToken, { ...WEB_COOKIE_OPTIONS, maxAge: CONFIGS.ACCESS_TOKEN_JWT_EXPIRES_IN });
        context.res.cookie("__refresh", result.token.refreshToken, { ...WEB_COOKIE_OPTIONS, maxAge: CONFIGS.REFRESH_TOKEN_JWT_EXPIRES_IN });
        return result;
    },
    authVerifyEmail: async (_: any, { userId, verificationOtp }: { userId: string; verificationOtp: string }, __: Context): Promise<boolean> => {
        return await AuthService.verifyEmail({ userId, verificationOtp });
    },
    authRequestPasswordReset: async (_: any, { email }: { email: string }, __: Context): Promise<boolean | null> => {
        return await AuthService.requestPasswordReset(email);
    },
    authRefreshTokens: async (_: any, { refreshToken }: { refreshToken: string }, context: Context): Promise<AuthToken> => {
        const token = (refreshToken || context.req.cookies.__refresh) as string;
        const result = await AuthService.refreshTokens(token);
        context.res.cookie("__access", result.accessToken, { ...WEB_COOKIE_OPTIONS, maxAge: CONFIGS.ACCESS_TOKEN_JWT_EXPIRES_IN });
        context.res.cookie("__refresh", result.refreshToken, { ...WEB_COOKIE_OPTIONS, maxAge: CONFIGS.REFRESH_TOKEN_JWT_EXPIRES_IN });
        return result;
    },
    authUpdatePassword: async (_: any, { oldPassword, newPassword }: { oldPassword: string; newPassword: string }, context: Context): Promise<boolean> => {
        const user = guard(context.user, CONFIGS.APP_ROLES.USER);
        return await AuthService.updatePassword(user.id, { oldPassword, newPassword });
    },
    authRequestEmailVerification: async (_: any, { userId }: { userId: string }, __: Context): Promise<boolean> => {
        return await AuthService.requestEmailVerification(userId);
    },
    authResetPassword: async (_: any, { userId, resetOtp, password }: { userId: string; resetOtp: string; password: string }, __: Context): Promise<boolean> => {
        return await AuthService.resetPassword({ userId, resetOtp, password });
    },
    authLogout: async (_: any, { refreshToken }: { refreshToken: string }, context: Context): Promise<boolean> => {
        const token = refreshToken || context.req.cookies.__refresh;
        const result = await AuthService.logout(token);
        context.res.cookie("__access", "", { ...WEB_COOKIE_OPTIONS, maxAge: 0 });
        context.res.cookie("__refresh", "", { ...WEB_COOKIE_OPTIONS, maxAge: 0 });
        return result;
    },
};
