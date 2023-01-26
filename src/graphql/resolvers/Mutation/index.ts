import authMutations from "./auth.mutation";
import userMutations from "./user.mutation";

export default {
    ...authMutations,
    ...userMutations
};
