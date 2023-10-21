import userQueries from "@/graphql/resolvers/Query/user.query";
import helloQueries from "@/graphql/resolvers/Query/hello.query";

export default {
    ...userQueries,
    ...helloQueries
};
