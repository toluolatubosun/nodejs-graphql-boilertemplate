/////////////////////// Service ///////////////////////

interface UserDataInput {
    name?: string;
    email?: string;
    image?: string;
    password?: string;
    role?: "user" | "admin";
}

/////////////////////// GraphQL Resolvers ///////////////////////

interface UserDataArgs {
    input: UserDataInput;
}

interface UserUpdateArgs {
    userId: string;
    input: UserDataInput;
}

interface UserDeleteArgs {
    userId: string;
}

interface UserArgs {
    userId: string;
}

interface UsersArgs {
    pagination: PaginationInput;
}
