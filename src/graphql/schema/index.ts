import { gql } from "apollo-server-express";

const typeDefs = gql`
    type Query {
        hello: String!

        me: User!
        user(userId: ID!): User!
        users(pagination: PaginationInput!): UsersPayload
    }

    type Mutation {
        authLogin(input: LoginInput!): AuthPayload!
        authLogout(refreshToken: String!): Boolean!
        authRegister(input: RegisterInput!): AuthPayload!
        authRequestPasswordReset(email: String!): Boolean!
        authRefreshAccessToken(refreshToken: String!): String!
        authRequestEmailVerification(email: String!): Boolean!
        authVerifyEmail(userId: ID!, verifyToken: String!): Boolean!
        authUpdatePassword(oldPassword: String!, newPassword: String!): Boolean!
        authResetPassword(userId: ID!, resetToken: String!, password: String!): Boolean!

        userDelete(userId: ID!): User!
        userCreate(input: UserDataInput!): User!
        userUpdateMe(input: UserDataInput!): User!
        userUpdate(userId: ID!, input: UserDataInput!): User!
    }

    type User {
        id: ID!
        name: String!
        role: String!
        email: String!
        image: String
        password: String!
        createdAt: String!
        updatedAt: String!
        isActive: Boolean!
        isVerified: Boolean!
    }

    type AuthPayload {
        user: User!
        token: AuthTokens!
    }

    type AuthTokens {
        accessToken: String!
        refreshToken: String!
    }

    type PaginationPayload {
        total: Int!
        next: String
        hasNext: Boolean!
    }

    type UsersPayload {
        users: [User!]!
        pagination: PaginationPayload!
    }

    # INPUT TYPES

    input PaginationInput {
        next: ID
        limit: Int
    }

    input RegisterInput {
        name: String!
        email: String!
        password: String!
    }

    input LoginInput {
        email: String!
        password: String!
    }

    input UserDataInput {
        role: Role
        name: String
        email: String
        image: String
        password: String
    }

    # ENUM TYPES

    enum Role {
        user
        admin
    }
`;

export default typeDefs;
