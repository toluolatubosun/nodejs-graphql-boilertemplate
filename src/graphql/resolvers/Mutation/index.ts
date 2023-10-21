import authMutations from "@/graphql/resolvers/Mutation/auth.mutation";
import userMutations from "@/graphql/resolvers/Mutation/user.mutation";

export default {
    ...authMutations,
    ...userMutations
};
