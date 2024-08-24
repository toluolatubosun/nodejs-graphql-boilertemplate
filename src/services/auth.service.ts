import { z } from "zod";
import bcryptjs from "bcryptjs";
import * as Sentry from "@sentry/node";

import { CONFIGS } from "@/configs";
import UserModel from "@/models/user.model";
import MailService from "@/services/mail.service";
import TokenService from "@/services/token.service";
import CustomError from "@/utilities/graphql/custom-error";
import { extractZodError } from "@/utilities/helpful-methods";
import TokenModel, { TOKEN_TYPES } from "@/models/token.model";

class AuthService {
    async register(input: Object) {
        const { error, data } = z
            .object({
                input: z.object({
                    name: z.string().trim(),
                    email: z.string().email().trim(),
                    password: z.string().min(6).trim(),
                }),
            })
            .safeParse({ input });
        if (error) throw new CustomError(extractZodError(error));

        let emailExist = await UserModel.findOne({ email: data.input.email });
        if (emailExist) throw new CustomError("email already exists");

        const passwordHash = await bcryptjs.hash(data.input.password, CONFIGS.BCRYPT_SALT);

        const context = {
            name: data.input.name,
            email: data.input.email,
            password: passwordHash,
        };

        const user = await new UserModel(context).save();

        // Generate token
        const token = await TokenService.generateAuthTokens({ _id: user._id });

        // Request email verification
        await this.requestEmailVerification(user.id, true);

        return { user, token };
    }

    async login(input: Object) {
        const { error, data } = z
            .object({
                input: z.object({
                    email: z.string().email().trim(),
                    password: z.string().trim(),
                }),
            })
            .safeParse({ input });
        if (error) throw new CustomError(extractZodError(error));

        // Check if user exist
        const user = await UserModel.findOne({ email: data.input.email });
        if (!user) throw new CustomError("incorrect email or password");

        // Check if password is correct
        const validPassword = await bcryptjs.compare(data.input.password, user.password);
        if (!validPassword) throw new CustomError("incorrect email or password");

        // check if account is disabled
        if (user.accountDisabled === true) throw new CustomError("account has been disabled, if you believe this is a mistake kindly contact support");

        // Generate token
        const token = await TokenService.generateAuthTokens({ _id: user._id });

        return { user, token };
    }

    async verifyEmail(input: Object) {
        const { error, data } = z
            .object({
                input: z.object({
                    userId: z.string().trim(),
                    verificationOtp: z.string().trim(),
                }),
            })
            .safeParse({ input });
        if (error) throw new CustomError(extractZodError(error));

        // Check if user exists
        const user = await UserModel.findOne({ _id: data.input.userId });
        if (!user) throw new CustomError("invalid user id");

        const isValidToken = await TokenService.verifyOtpToken({
            userId: String(user._id),
            deleteIfValidated: true,
            code: data.input.verificationOtp,
            token: data.input.verificationOtp,
            tokenType: TOKEN_TYPES.EMAIL_VERIFICATION,
        });
        if (!isValidToken) throw new CustomError("invalid or expired token. Kindly request a new verification link");

        // Update user
        await UserModel.updateOne({ _id: user._id }, { $set: { emailVerified: true } });

        return true;
    }

    async requestEmailVerification(userId: string, isNewUser = false) {
        // Check if user exists
        const user = await UserModel.findOne({ _id: userId });
        if (!user) throw new CustomError("invalid user id");

        // Check if email is already verified
        if (user.emailVerified) throw new CustomError("email is already verified");

        const token = await TokenModel.findOne({ userId: user.id, type: "email-verification" });
        if (token) await token.deleteOne();

        // Create new otp (code and token)
        const verificationOtp = await TokenService.generateOtpToken({ userId: String(user._id), tokenType: TOKEN_TYPES.EMAIL_VERIFICATION });

        if (isNewUser) {
            await MailService.sendWelcomeUserEmail({ user: { _id: user._id, email: user.email, name: user.name }, verificationToken: verificationOtp.token });
        } else {
            await MailService.sendVerificationLinkEmail({ user: { _id: user._id, email: user.email, name: user.name }, verificationToken: verificationOtp.token });
        }

        return true;
    }

    async requestPasswordReset(email: string) {
        // Check if user exists
        const user = await UserModel.findOne({ email });
        // Don't throw error if user doesn't exist, just return null - so hackers don't exploit this route to know emails on the platform
        if (!user) return null;

        // Create new otp (code and token)
        const resetOtp = await TokenService.generateOtpToken({ userId: String(user._id), tokenType: TOKEN_TYPES.PASSWORD_RESET });

        await MailService.sendPasswordResetEmail({ user: { _id: user._id, email: user.email, name: user.name }, resetToken: resetOtp.token });

        return true;
    }

    async resetPassword(input: Object) {
        const { error, data } = z
            .object({
                input: z.object({
                    userId: z.string().trim(),
                    resetOtp: z.string().trim(),
                    password: z.string().trim(),
                }),
            })
            .safeParse({ input });
        if (error) throw new CustomError(extractZodError(error));

        // Check if user exists
        const user = await UserModel.findOne({ _id: data.input.userId });
        if (!user) throw new CustomError("invalid user id");

        const isValidToken = await TokenService.verifyOtpToken({
            userId: String(user._id),
            code: data.input.resetOtp,
            token: data.input.resetOtp,
            deleteIfValidated: true,
            tokenType: TOKEN_TYPES.PASSWORD_RESET,
        });
        if (!isValidToken) throw new CustomError("invalid or expired token. Kindly make a new password reset request");

        // Hash new password and update user
        const passwordHash = await bcryptjs.hash(data.input.password, CONFIGS.BCRYPT_SALT);
        await UserModel.updateOne({ _id: user._id }, { $set: { password: passwordHash } });

        return true;
    }

    async updatePassword(userId: string, input: Object) {
        const { error, data } = z
            .object({
                input: z.object({
                    oldPassword: z.string().trim(),
                    newPassword: z.string().min(6).trim(),
                }),
            })
            .safeParse({ input });
        if (error) throw new CustomError(extractZodError(error));

        const user = await UserModel.findOne({ _id: userId });
        if (!user) throw new CustomError("user dose not exist");

        // Check if user password is correct
        const isCorrect = await bcryptjs.compare(data.input.oldPassword, user.password);
        if (!isCorrect) throw new CustomError("incorrect password");

        const hash = await bcryptjs.hash(data.input.newPassword, CONFIGS.BCRYPT_SALT);

        await UserModel.updateOne({ _id: userId }, { $set: { password: hash } }, { new: true });

        return true;
    }

    async refreshTokens(refreshToken: string) {
        // verify and refresh tokens
        const refreshedTokens = await TokenService.refreshAuthTokens(refreshToken);

        return refreshedTokens;
    }

    async logout(refreshToken: string | null | undefined) {
        if (!refreshToken) return true;

        // revoke refresh token
        await TokenService.revokeRefreshToken(refreshToken).catch((error) => {
            Sentry.captureException(new Error(error), { extra: { body: { refreshToken } } });
        });

        return true;
    }
}

export default new AuthService();
