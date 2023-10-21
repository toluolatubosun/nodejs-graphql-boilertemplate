import ms from "ms";
import { nanoid } from "nanoid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { SESClient, SendTemplatedEmailCommand, SendBulkTemplatedEmailCommand, SendEmailCommand } from "@aws-sdk/client-ses";

import { CONFIGS } from "@/configs";
import CustomError from "@/utilities/graphql/custom-error";

import type { ObjectCannedACL } from "@aws-sdk/client-s3";

class AWSUtil {
    s3: S3Client;
    ses: SESClient;
    secretsManager: SecretsManagerClient;
    region = "us-east-1";
    emailFrom = "The King <noreply@plugtent.com>";
    credentials = {
        accessKeyId: CONFIGS.AWS.ACCESS_KEY_ID,
        secretAccessKey: CONFIGS.AWS.SECRET_ACCESS_KEY
    };

    constructor() {
        this.s3 = new S3Client({ region: this.region, credentials: this.credentials });
        this.ses = new SESClient({ region: this.region, credentials: this.credentials });
        this.secretsManager = new SecretsManagerClient({ region: this.region, credentials: this.credentials });
    }

    async uploadBase64(base64: string, folder: string, ACL = "private") {
        const buffer = Buffer.from(base64.replace(/^data:.+\/\w+;base64,/, ""), "base64");
        if (buffer.length > 10 * 1024 * 1024) throw new CustomError("File size limit exceeded (10MB)", "FILE_SIZE_EXCEEDED");

        const params = {
            Body: buffer,
            ContentEncoding: "base64",
            ACL: ACL as ObjectCannedACL,
            Bucket: CONFIGS.AWS.S3_BUCKET,
            ContentType: base64.split(";")[0]?.split(":")[1],
            Key: `${folder}/${nanoid()}_${new Date().getTime()}`
        };

        const command = new PutObjectCommand(params);
        await this.s3.send(command);

        return `https://${CONFIGS.AWS.S3_BUCKET}.s3.amazonaws.com/${params.Key}`;
    }

    async deleteFile(Location: string) {
        if (!Location.includes(CONFIGS.AWS.S3_BUCKET)) return;

        const params = {
            Bucket: CONFIGS.AWS.S3_BUCKET,
            Key: Location.split(`s3.amazonaws.com/`).pop() as string
        };

        const command = new DeleteObjectCommand(params);
        const data = await this.s3.send(command);

        return data;
    }

    async getFileData(Location: string) {
        if (!Location.includes(CONFIGS.AWS.S3_BUCKET)) return null;

        const params = {
            Bucket: CONFIGS.AWS.S3_BUCKET,
            Key: Location.split(`s3.amazonaws.com/`).pop()
        };

        const command = new GetObjectCommand(params);
        const data = await this.s3.send(command);

        // Update the returned value based on your use case
        return { contentType: data.ContentType, totalBytes: data.ContentLength };
    }

    async generateUploadUrl(data: AWSUploadUrlData, ACL = "private") {
        const params = {
            ACL: ACL as ObjectCannedACL,
            Bucket: CONFIGS.AWS.S3_BUCKET,
            ContentType: data.contentType,
            Key: `${data.folder}/${nanoid()}_${new Date().getTime()}`
        };

        const command = new PutObjectCommand(params);
        const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: ms("15m") / 1000 });

        return {
            signedUrl,
            publicUrl: `https://${CONFIGS.AWS.S3_BUCKET}.s3.amazonaws.com/${params.Key}`
        };
    }

    async getSignedUrl(Location: string, Expires?: number) {
        if (!Location.includes(CONFIGS.AWS.S3_BUCKET)) return Location;

        const params = {
            Bucket: CONFIGS.AWS.S3_BUCKET,
            Key: Location.split(`s3.amazonaws.com/`).pop()
        };

        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(this.s3, command, { expiresIn: Expires ?? ms("1h") / 1000 });

        return url;
    }

    async sendHTMLEmail(to: string | string[], data: HTMLEmailData, from?: string) {
        const params = {
            Source: from ?? this.emailFrom,
            Destination: {
                ToAddresses: Array.isArray(to) ? to : [to]
            },
            Message: {
                Body: {
                    Html: {
                        Data: data.html,
                        Charset: "UTF-8"
                    }
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: data.subject
                }
            }
        };

        const command = new SendEmailCommand(params);
        return await this.ses.send(command);
    }

    async sendTemplateEmail(to: string | string[], data: AWSTemplateEmailData, from?: string) {
        const params = {
            Template: data.template,
            Source: from ?? this.emailFrom,
            TemplateData: JSON.stringify(data.templateData),
            Destination: {
                ToAddresses: Array.isArray(to) ? to : [to]
            }
        };

        const command = new SendTemplatedEmailCommand(params);
        return await this.ses.send(command);
    }

    async sendBulkTemplateEmail(to: AWSTemplateBulkEmailReceiverData[], data: AWSTemplateEmailData, from?: string) {
        const params = {
            Template: data.template,
            Source: from ?? this.emailFrom,
            DefaultTemplateData: JSON.stringify(data.templateData),
            Destinations: to.map((receiver: any) => ({
                Destination: {
                    ToAddresses: [receiver.email]
                },
                ReplacementTemplateData: JSON.stringify(receiver.data)
            }))
        };

        const command = new SendBulkTemplatedEmailCommand(params);
        return await this.ses.send(command);
    }

    async getSecretValue(SecretId: string) {
        const params = { SecretId };
        const command = new GetSecretValueCommand(params);

        const result = await this.secretsManager.send(command);
        return JSON.parse(result.SecretString as string);
    }
}

export default new AWSUtil();
