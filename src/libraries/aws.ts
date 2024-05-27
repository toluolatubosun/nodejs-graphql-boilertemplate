import crypto from "crypto";
import * as Sentry from "@sentry/node";
import { SESClient } from "@aws-sdk/client-ses";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, ObjectCannedACL, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import { CONFIGS, DEPLOYMENT_ENV } from "@/configs";

interface DeleteFileOptions {
    s3Bucket: string;
    Location: string | null;
}

interface GetSignedUrlOptions {
    s3Bucket: string;
    Location: string;
    Expires?: number;
}

interface UploadFileOptions {
    s3Bucket: string;
    base64File: string;

    folder: string;
    fileName?: string;
    ACL?: ObjectCannedACL;
}

// AWS SES
// =============================================================================

export const sesClient = new SESClient({
    region: "eu-west-2", // TODO: replace with the appropriate region
    credentials: {
        accessKeyId: CONFIGS.AWS.ACCESS_KEY_ID as string,
        secretAccessKey: CONFIGS.AWS.SECRET_ACCESS_KEY as string,
    },
});

// AWS S3
// =============================================================================

const s3Client = new S3Client({
    region: "eu-west-1", // TODO: replace with the appropriate region
    credentials: {
        accessKeyId: CONFIGS.AWS.ACCESS_KEY_ID as string,
        secretAccessKey: CONFIGS.AWS.SECRET_ACCESS_KEY as string,
    },
});

export const deleteFileFromS3 = async ({ s3Bucket, Location }: DeleteFileOptions) => {
    if (!Location || !Location.includes(s3Bucket)) return;

    const params = {
        Bucket: s3Bucket,
        Key: Location.split("amazonaws.com/").pop() as string,
    };

    try {
        await s3Client.send(new DeleteObjectCommand(params));

        return true;
    } catch (error: any) {
        Sentry.captureException(new Error("From Third-Party: fn (deleteFileFromS3)"), { extra: { params, response: error }, level: "error" });
        return false;
    }
};

export const uploadFileToS3 = async ({ s3Bucket, base64File, folder, fileName, ACL = "private" }: UploadFileOptions) => {
    const finalFileName = fileName ? fileName : `${crypto.randomBytes(30).toString("hex")}`;
    const buffer = Buffer.from(base64File.replace(/^data:.+\/\w+;base64,/, ""), "base64");

    const params = {
        ACL,
        Body: buffer,
        Bucket: s3Bucket,
        ContentEncoding: "base64",
        ContentType: base64File.split(";")[0]?.split(":")[1],
        Key: `${DEPLOYMENT_ENV}/${folder}/${finalFileName}`,
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        return `https://${s3Bucket}.s3.amazonaws.com/${params.Key}`;
    } catch (error: any) {
        Sentry.captureException(new Error("From Third-Party: fn (uploadFileToS3)"), { extra: { params, response: error }, level: "error" });
        return null;
    }
};

export const getSignedUrlFromS3 = async ({ s3Bucket, Location, Expires = 60 * 60 * 24 }: GetSignedUrlOptions) => {
    if (!Location.includes(s3Bucket)) return null;

    const params = {
        Bucket: s3Bucket,
        Key: Location.split("amazonaws.com/").pop(),
    };

    try {
        const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand(params), { expiresIn: Expires });

        return signedUrl;
    } catch (error: any) {
        Sentry.captureException(new Error("From Third-Party: fn (getSignedUrlFromS3)"), { extra: { params, response: error }, level: "error" });
        return null;
    }
};
