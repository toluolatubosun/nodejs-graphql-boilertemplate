# My Apollo Server Express Starter

My apollo server express starter. Based off [eni4sure/nodejs-boilertemplate](https://github.com/eni4sure/nodejs-boilertemplate) 🚀🙌

## Technologies

-   GraphQL
-   Apollo Server Express
-   Express
-   Mongoose

## Linters

-   ESLint
-   Prettier

## How to handle files uploads

According to this post by the Apollo Team on [GraphQL File Upload](https://www.apollographql.com/blog/backend/file-uploads/file-upload-best-practices/) it is recommended best practice not to allow multi-part forms in your GraphQL API<br><br>
If you really want to implement files upload you can follow this example by in Apollo Docs that makes used of `graphql-upload` [Here](https://www.apollographql.com/docs/apollo-server/data/file-uploads/)<br><br>
In this example for file uploads are implemented using Cloudinary and the data is sent as a base64 string instead of a file in a multi-part form.<br><br>
You can also update the code to use AWS S3 instead of Cloudinary. Check out `src/libraries/aws.ts`

## Authentication

Authentication details can be passed in the `Authorization` header or detected from the `req.cookies` object.

## Email

Email is sent using nodemailer and your SMTP credentials. I also added the coded for sending email using AWS SES. You can find it in `src/libraries/aws.ts`
