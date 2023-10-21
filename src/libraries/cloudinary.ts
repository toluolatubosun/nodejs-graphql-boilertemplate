import cloudinary from "cloudinary";

import { CONFIGS } from "@/configs";
import CustomError from "@/utilities/graphql/custom-error";

class CloudinaryUtil {
    constructor() {
        cloudinary.v2.config({
            cloudinary_url: CONFIGS.CLOUDINARY_URL
        });
    }

    async uploadBase64(base64: string, folder: string) {
        // This was implemented this way because cloudinary's upload function does not return errors in a user friendly way
        return new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload(base64, { folder: `${CONFIGS.APP_NAME}/${folder}` }, (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(new CustomError((error && error.message) || "an error uploading the file"));
                }
            });
        });
    }

    async deleteFile(url: string) {
        if (!url.includes("cloudinary")) return false;

        const publicId = this.getPublicId(url);
        const { result } = await cloudinary.v2.uploader.destroy(publicId);

        return result === "ok" ? true : false;
    }

    getPublicId(url: string) {
        if (!url.includes(CONFIGS.APP_NAME)) return url;

        const id = url.split(CONFIGS.APP_NAME)[1]?.split(".")[0];
        return CONFIGS.APP_NAME + id;
    }
}

export default new CloudinaryUtil();
