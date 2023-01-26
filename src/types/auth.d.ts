/////////////////////// Service ///////////////////////

interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

interface LoginInput {
    email: string;
    password: string;
}

interface GenerateTokenInput {
    userId: string;
    role: string;
}

interface RefreshTokenInput {
    refreshToken: string;
}

interface LogoutInput {
    refreshToken: string;
}

interface VerifyEmailInput {
    userId: string;
    verifyToken: string;
}

interface ResetPasswordInput {
    userId: string;
    resetToken: string;
    password: string;
}

interface UpdatePasswordInput {
    oldPassword: string;
    newPassword: string;
}

interface AuthToken {
    accessToken: string;
    refreshToken: string;
}

/////////////////////// GraphQL Resolvers ///////////////////////

interface AuthRegisterArgs {
    input: RegisterInput;
}

interface AuthLoginArgs {
    input: LoginInput;
}

interface AuthRequestPasswordResetArgs {
    email: string;
}

interface AuthRequestEmailVerificationArgs {
    email: string;
}

interface AuthVerifyEmailArgs {
    userId: string;
    verifyToken: string;
}

interface AuthUpdatePasswordArgs {
    oldPassword: string;
    newPassword: string;
}

interface AuthResetPasswordArgs {
    userId: string;
    resetToken: string;
    password: string;
}

interface AuthRefreshAccessTokenArgs {
    refreshToken: string;
}

interface AuthLogoutArgs {
    refreshToken: string;
}
