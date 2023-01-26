import cloudinary from "cloudinary";

import CustomError from "./graphql/custom-error";
import { CLOUDINARY_URL, APP_NAME } from "../config";

class CloudinaryUtil {
    constructor() {
        cloudinary.v2.config({
            cloudinary_url: CLOUDINARY_URL
        });
    }

    async uploadBase64(base64: string, folder: string) {
        // This was implemented this way because cloudinary's upload function does not return errors in a user friendly way
        return new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload(base64, { folder: `${APP_NAME}/${folder}` }, (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(new CustomError((error && error.message) || "an error uploading the file"));
                }
            });
        });
    }

    async delete(url: string) {
        if (!url.includes("cloudinary")) return false;

        const publicId = this.getPublicId(url);
        const { result } = await cloudinary.v2.uploader.destroy(publicId);

        return result === "ok" ? true : false;
    }

    getPublicId(url: string) {
        const id = url.split(APP_NAME)[1].split(".")[0];
        return APP_NAME + id;
    }
}

export default new CloudinaryUtil();
