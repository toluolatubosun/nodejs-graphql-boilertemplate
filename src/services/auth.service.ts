import Joi from "joi";
import bcryptjs from "bcryptjs";
import * as Sentry from "@sentry/node";

import { CONFIGS } from "@/configs";
import UserModel from "@/models/user.model";
import MailService from "@/services/mail.service";
import TokenService from "@/services/token.service";
import CustomError from "@/utilities/graphql/custom-error";
import TokenModel, { TOKEN_TYPES } from "@/models/token.model";

class AuthService {
    async register(input: RegisterInput) {
        const { error, value: data } = Joi.object<RegisterInput>({
            email: Joi.string().email().required(),
            name: Joi.string().min(3).max(30).required(),
            password: Joi.string().min(6).max(30).required(),
        })
            .options({ stripUnknown: true })
            .validate(input);
        if (error) throw new CustomError(error.message);

        let emailExist = await UserModel.findOne({ email: data.email });
        if (emailExist) throw new CustomError("email already exists");

        const passwordHash = await bcryptjs.hash(data.password, CONFIGS.BCRYPT_SALT);

        const context = {
            name: data.name,
            email: data.email,
            password: passwordHash,
        };

        const user = await new UserModel(context).save();

        // Generate token
        const token = await TokenService.generateAuthTokens({ _id: user._id });

        // Request email verification
        await this.requestEmailVerification(user.id, true);

        return { user, token };
    }

    async login(input: LoginInput) {
        const { error, value: data } = Joi.object<LoginInput>({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(30).required(),
        })
            .options({ stripUnknown: true })
            .validate(input);
        if (error) throw new CustomError(error.message);

        // Check if user exist
        const user = await UserModel.findOne({ email: data.email });
        if (!user) throw new CustomError("incorrect email or password");

        // Check if password is correct
        const validPassword = await bcryptjs.compare(data.password, user.password);
        if (!validPassword) throw new CustomError("incorrect email or password");

        // check if account is disabled
        if (user.accountDisabled === true) throw new CustomError("account has been disabled, if you believe this is a mistake kindly contact support");

        // Generate token
        const token = await TokenService.generateAuthTokens({ _id: user._id });

        return { user, token };
    }

    async verifyEmail(input: VerifyEmailInput) {
        const { error, value: data } = Joi.object<VerifyEmailInput>({
            userId: Joi.string().required(),
            verificationOtp: Joi.string().required(),
        })
            .options({ stripUnknown: true })
            .validate(input);
        if (error) throw new CustomError(error.message);

        // Check if user exists
        const user = await UserModel.findOne({ _id: data.userId });
        if (!user) throw new CustomError("invalid user id");

        const isValidToken = await TokenService.verifyOtpToken({
            userId: user._id,
            deleteIfValidated: true,
            code: data.verificationOtp,
            token: data.verificationOtp,
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
        const verificationOtp = await TokenService.generateOtpToken({ userId: user._id, tokenType: TOKEN_TYPES.EMAIL_VERIFICATION });

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
        const resetOtp = await TokenService.generateOtpToken({ userId: user._id, tokenType: TOKEN_TYPES.PASSWORD_RESET });

        await MailService.sendPasswordResetEmail({ user: { _id: user._id, email: user.email, name: user.name }, resetToken: resetOtp.token });

        return true;
    }

    async resetPassword(input: ResetPasswordInput) {
        const { error, value: data } = Joi.object<ResetPasswordInput>({
            userId: Joi.string().required(),
            resetOtp: Joi.string().required(),
            password: Joi.string().min(6).max(30).required(),
        })
            .options({ stripUnknown: true })
            .validate(input);
        if (error) throw new CustomError(error.message);

        // Check if user exists
        const user = await UserModel.findOne({ _id: data.userId });
        if (!user) throw new CustomError("invalid user id");

        const isValidToken = await TokenService.verifyOtpToken({
            userId: user._id,
            code: data.resetOtp,
            token: data.resetOtp,
            deleteIfValidated: true,
            tokenType: TOKEN_TYPES.PASSWORD_RESET,
        });
        if (!isValidToken) throw new CustomError("invalid or expired token. Kindly make a new password reset request");

        // Hash new password and update user
        const passwordHash = await bcryptjs.hash(data.password, CONFIGS.BCRYPT_SALT);
        await UserModel.updateOne({ _id: user._id }, { $set: { password: passwordHash } });

        return true;
    }

    async updatePassword(userId: string, input: UpdatePasswordInput) {
        const { error, value: data } = Joi.object<UpdatePasswordInput>({
            oldPassword: Joi.string().min(6).max(30).required(),
            newPassword: Joi.string().min(6).max(30).required(),
        })
            .options({ stripUnknown: true })
            .validate(input);
        if (error) throw new CustomError(error.message);

        const user = await UserModel.findOne({ _id: userId });
        if (!user) throw new CustomError("user dose not exist");

        // Check if user password is correct
        const isCorrect = await bcryptjs.compare(data.oldPassword, user.password);
        if (!isCorrect) throw new CustomError("incorrect password");

        const hash = await bcryptjs.hash(data.newPassword, CONFIGS.BCRYPT_SALT);

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
