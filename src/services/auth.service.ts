import Joi from "joi";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

import { CONFIGS } from "@/configs";
import User from "@/models/user.model";
import Token from "@/models/token.model";
import MailService from "@/services/mail.service";
import CustomError from "@/utilities/graphql/custom-error";

class AuthService {
    async register(input: RegisterInput) {
        const { error, value: data } = Joi.object<RegisterInput>({
            email: Joi.string().email().required(),
            name: Joi.string().min(3).max(30).required(),
            password: Joi.string().min(6).max(30).required()
        })
            .options({ stripUnknown: true })
            .validate(input);
        if (error) throw new CustomError(error.message);

        let user = await User.findOne({ email: data.email });
        if (user) throw new CustomError("email already exists");

        user = await new User(data).save();

        // Request email verification
        await this.requestEmailVerification(user.email, true);

        const authTokens = await this.generateAuthTokens({ userId: user.id, role: user.role });

        return { user, token: authTokens };
    }

    async login(input: LoginInput) {
        const { error, value: data } = Joi.object<LoginInput>({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(30).required()
        })
            .options({ stripUnknown: true })
            .validate(input);
        if (error) throw new CustomError(error.message);

        // Check if user exist
        const user = await User.findOne({ email: data.email });
        if (!user) throw new CustomError("incorrect email or password");

        // Check if user password is correct
        const isCorrect = await bcrypt.compare(data.password, user.password);
        if (!isCorrect) throw new CustomError("incorrect email or password");

        const authTokens = await this.generateAuthTokens({ userId: user.id, role: user.role });

        return { user, token: authTokens };
    }

    async generateAuthTokens(data: GenerateTokenInput) {
        const { userId, role } = data;

        const accessToken = JWT.sign({ id: userId, role }, CONFIGS.JWT_SECRET, { expiresIn: CONFIGS.ACCESS_TOKEN_JWT_EXPIRES_MS / 1000 });

        const refreshToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(refreshToken, CONFIGS.BCRYPT_SALT);

        const refreshTokenJWT = JWT.sign({ userId, refreshToken }, CONFIGS.JWT_SECRET, { expiresIn: CONFIGS.REFRESH_TOKEN_JWT_EXPIRES_MS / 1000 });

        await new Token({
            userId,
            token: hash,
            type: "refresh-token",
            expiresAt: Date.now() + CONFIGS.REFRESH_TOKEN_JWT_EXPIRES_MS
        }).save();

        return { accessToken, refreshToken: refreshTokenJWT };
    }

    async refreshAccessToken(refreshTokenJWT: string) {
        const { error, value: data } = Joi.object<{ refreshTokenJWT: string }>({
            refreshTokenJWT: Joi.string().required()
        })
            .options({ stripUnknown: true })
            .validate({ refreshTokenJWT });
        if (error) throw new CustomError(error.message);

        const decoded: any = JWT.verify(data.refreshTokenJWT, CONFIGS.JWT_SECRET);
        const { userId, refreshToken } = decoded;

        const user = await User.findOne({ _id: userId });
        if (!user) throw new CustomError("User does not exist");

        const RTokens = await Token.find({ userId, type: "refresh-token" });
        if (RTokens.length === 0) throw new CustomError("invalid or expired refresh token");

        let tokenExists = false;
        for (const token of RTokens) {
            const isValid = await bcrypt.compare(refreshToken, token.token);
            if (isValid) {
                tokenExists = true;
                break;
            }
        }

        if (!tokenExists) throw new CustomError("invalid or expired refresh token");

        return JWT.sign({ id: user.id, role: user.role }, CONFIGS.JWT_SECRET, { expiresIn: CONFIGS.ACCESS_TOKEN_JWT_EXPIRES_MS / 1000 });
    }

    async logout(refreshTokenJWT: string) {
        const { error, value: data } = Joi.object<{ refreshTokenJWT: string }>({
            refreshTokenJWT: Joi.string().required()
        })
            .options({ stripUnknown: true })
            .validate({ refreshTokenJWT });
        if (error) throw new CustomError(error.message);

        const decoded: any = JWT.verify(data.refreshTokenJWT, CONFIGS.JWT_SECRET);
        const { refreshToken, userId } = decoded;

        const user = await User.findOne({ _id: userId });
        if (!user) throw new CustomError("User does not exist");

        const RTokens = await Token.find({ userId, type: "refresh-token" });
        if (RTokens.length === 0) throw new CustomError("invalid or expired refresh token");

        let tokenExists = false;
        for (const token of RTokens) {
            const isValid = await bcrypt.compare(refreshToken, token.token);
            if (isValid) {
                tokenExists = true;
                await token.deleteOne();
                break;
            }
        }

        if (!tokenExists) throw new CustomError("invalid or expired refresh token");

        return true;
    }

    async verifyEmail(input: VerifyEmailInput) {
        const { error, value: data } = Joi.object<VerifyEmailInput>({
            userId: Joi.string().required(),
            verificationToken: Joi.string().required()
        })
            .options({ stripUnknown: true })
            .validate(input);
        if (error) throw new CustomError(error.message);

        const user = await User.findOne({ _id: data.userId });
        if (!user) throw new CustomError("User does not exist");
        if (user.emailVerified) throw new CustomError("email is already verified");

        const VToken = await Token.findOne({ userId: data.userId, type: "email-verification" });
        if (!VToken) throw new CustomError("invalid or expired password reset token");

        const isValid = await bcrypt.compare(data.verificationToken, VToken.token);
        if (!isValid) throw new CustomError("invalid or expired password reset token");

        await User.updateOne({ _id: data.userId }, { $set: { emailVerified: true } }, { new: true });

        await VToken.deleteOne();

        return true;
    }

    async requestEmailVerification(email: string, isNewUser = true) {
        const user = await User.findOne({ email });
        if (!user) throw new CustomError("email does not exist");
        if (user.emailVerified) throw new CustomError("email is already verified");

        const token = await Token.findOne({ userId: user.id, type: "email-verification" });
        if (token) await token.deleteOne();

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(verificationToken, CONFIGS.BCRYPT_SALT);

        await new Token({
            token: hash,
            userId: user.id,
            type: "email-verification",
            expiresAt: Date.now() + CONFIGS.DEFAULT_DB_TOKEN_EXPIRES_MS
        }).save();

        if (isNewUser) {
            await MailService.sendWelcomeUserEmail({ user, verificationToken });
        } else {
            await MailService.sendVerificationLinkEmail({ user, verificationToken });
        }

        return true;
    }

    async requestPasswordReset(email: string) {
        const user = await User.findOne({ email });
        if (!user) throw new CustomError("email does not exist");

        const token = await Token.findOne({ userId: user.id, type: "password-reset" });
        if (token) await token.deleteOne();

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(resetToken, CONFIGS.BCRYPT_SALT);

        await new Token({
            token: hash,
            userId: user.id,
            type: "password-reset",
            expiresAt: Date.now() + CONFIGS.DEFAULT_DB_TOKEN_EXPIRES_MS
        }).save();

        await MailService.sendPasswordResetEmail({ user, resetToken });

        return true;
    }

    async resetPassword(input: ResetPasswordInput) {
        const { error, value: data } = Joi.object<ResetPasswordInput>({
            userId: Joi.string().required(),
            resetToken: Joi.string().required(),
            password: Joi.string().min(6).max(30).required()
        })
            .options({ stripUnknown: true })
            .validate(input);
        if (error) throw new CustomError(error.message);

        const RToken = await Token.findOne({ userId: data.userId, type: "reset_password" });
        if (!RToken) throw new CustomError("invalid or expired password reset token");

        const isValid = await bcrypt.compare(data.resetToken, RToken.token);
        if (!isValid) throw new CustomError("invalid or expired password reset token");

        const hash = await bcrypt.hash(data.password, CONFIGS.BCRYPT_SALT);

        await User.updateOne({ _id: data.userId }, { $set: { password: hash } }, { new: true });

        await RToken.deleteOne();

        return true;
    }

    async updatePassword(userId: string, input: UpdatePasswordInput) {
        const { error, value: data } = Joi.object<UpdatePasswordInput>({
            oldPassword: Joi.string().min(6).max(30).required(),
            newPassword: Joi.string().min(6).max(30).required()
        })
            .options({ stripUnknown: true })
            .validate(input);
        if (error) throw new CustomError(error.message);

        const user = await User.findOne({ _id: userId });
        if (!user) throw new CustomError("user dose not exist");

        // Check if user password is correct
        const isCorrect = await bcrypt.compare(data.oldPassword, user.password);
        if (!isCorrect) throw new CustomError("incorrect password");

        // Check if new password is same as old password
        if (data.oldPassword == data.newPassword) throw new CustomError("change password to something different");

        const hash = await bcrypt.hash(data.newPassword, CONFIGS.BCRYPT_SALT);

        await User.updateOne({ _id: userId }, { $set: { password: hash } }, { new: true });

        return true;
    }
}

export default new AuthService();
