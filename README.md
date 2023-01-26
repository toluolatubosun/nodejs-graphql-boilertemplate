# My Apollo Server Express Starter

## Technologies

-   GraphQL
-   Apollo Server Express
-   Express
-   Mongoose

## Linters

-   ESLint
-   Prettier

## How to handle files uploads

According to this post by the Apollo Team on [GraphQL File Upload](https://www.apollographql.com/blog/backend/file-uploads/file-upload-best-practices/) it is recommended best practice not to allow multi-part forms in your GraphQL API<br>
If you really want to implement files upload you can follow this example by in Apollo Docs that makes used of `graphql-upload` [Here](https://www.apollographql.com/docs/apollo-server/data/file-uploads/)<br>
In this example for file uploads are implemented using Cloudinary and the data is sent as a base64 string instead of a file in a multi-part form.
