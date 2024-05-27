import { render } from "@react-email/components";

import { CONFIGS } from "@/configs";
import mailer from "@/libraries/nodemailer";
import WelcomeUserEmail from "@/email-templates/welcome-user-email";
import PasswordResetEmail from "@/email-templates/password-reset-link-email";
import VerificationLinkEmail from "@/email-templates/verification-link-email";

import type { IUser } from "@/models/user.model";

class MailService {
    async sendWelcomeUserEmail(context: { user: Pick<IUser, "_id" | "name" | "email">; verificationToken: string }) {
        const emailProp = {
            name: context.user.name,
            verificationLink: `${CONFIGS.URL.AUTH_BASE_URL}/verify-email?verificationToken=${context.verificationToken}&userId=${context.user._id}`,
        };

        return await mailer.sendMail({
            to: context.user.email,
            subject: "Welcome to nodejs-graphql-boilertemplate",
            text: render(WelcomeUserEmail(emailProp), { plainText: true }),
            html: render(WelcomeUserEmail(emailProp)),
        });
    }

    async sendVerificationLinkEmail(context: { user: Pick<IUser, "_id" | "name" | "email">; verificationToken: string }) {
        const emailProp = {
            name: context.user.name,
            verificationLink: `${CONFIGS.URL.AUTH_BASE_URL}/verify-email?verificationToken=${context.verificationToken}&userId=${context.user._id}`,
        };

        return await mailer.sendMail({
            to: context.user.email,
            subject: "Verify your email address",
            text: render(VerificationLinkEmail(emailProp), { plainText: true }),
            html: render(VerificationLinkEmail(emailProp)),
        });
    }

    async sendPasswordResetEmail(context: { user: Pick<IUser, "_id" | "name" | "email">; resetToken: string }) {
        const emailProp = {
            name: context.user.name,
            resetLink: `${CONFIGS.URL.AUTH_BASE_URL}/reset-password?resetToken=${context.resetToken}&userId=${context.user._id}`,
        };

        return await mailer.sendMail({
            to: context.user.email,
            subject: "Reset your password",
            text: render(PasswordResetEmail(emailProp), { plainText: true }),
            html: render(PasswordResetEmail(emailProp)),
        });
    }
}

// For testing purposes, uncomment code below and run `yarn start`
// new MailService().sendWelcomeUserEmail({
//     user: {
//         _id: "5f9b3b1b9b3b1b9b3b1b9b3b",
//         firstName: "John",
//         email: "", // Add your email here to test
//     },
//     verificationToken: "5f9b3b1b9b3b1b9b3b1b9b3b",
// });

export default new MailService();
