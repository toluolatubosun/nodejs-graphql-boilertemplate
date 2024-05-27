import Joi from "joi";
import CloudinaryUtil from "@/libraries/cloudinary";
import UserModel, { IUser } from "@/models/user.model";
import CustomError from "@/utilities/graphql/custom-error";

import type { UploadApiResponse } from "cloudinary";

class UserService {
    async create(input: UserDataInput) {
        const { error, value: data } = Joi.object<UserDataInput>({
            name: Joi.string().required(),
            role: Joi.string().optional(),
            image: Joi.string().optional(),
            password: Joi.string().required(),
            email: Joi.string().email().required(),
        })
            .options({ stripUnknown: true })
            .validate(input);
        if (error) throw new CustomError(error.message);

        if (data.image) {
            data.image = ((await CloudinaryUtil.uploadBase64(data.image, "users")) as UploadApiResponse).secure_url;
        }

        return await new UserModel(data).save();
    }

    async getAll(input: PaginationInput) {
        const { limit = 10, page = 1 } = input;

        const filter: Record<string, any> = {};

        const options = {
            page,
            limit,
            sort: { createdAt: -1 },
        };

        const { docs, ...pagination } = await UserModel.paginate(filter, options);

        return {
            users: docs,
            pagination,
        };
    }

    async getOne(userId: string) {
        const user = await UserModel.findOne({ _id: userId }, { password: 0, __v: 0 });
        if (!user) throw new CustomError("user does not exist");

        return user;
    }

    async update(userId: string, input: UserUpdateInput) {
        const { error, value: data } = Joi.object<UserUpdateInput>({
            name: Joi.string().optional(),
            image: Joi.string().optional(),
        })
            .options({ stripUnknown: true })
            .validate(input);
        if (error) throw new CustomError(error.message);

        const user = await UserModel.findOne({ _id: userId });
        if (!user) throw new CustomError("user not found");

        const updateContext: Record<string, any> = {
            name: data.name,
            image: data.image,
        };

        if (data.image) {
            updateContext.image = ((await CloudinaryUtil.uploadBase64(data.image, "users")) as UploadApiResponse).secure_url;
            if (user.image) await CloudinaryUtil.deleteFile(user.image);
        }

        await UserModel.updateOne({ _id: userId }, { $set: updateContext }, { new: true });

        return { id: user.id, ...user.toObject(), ...updateContext } as IUser;
    }

    async delete(userId: string) {
        const user = await UserModel.findOne({ _id: userId });
        if (!user) throw new CustomError("user does not exist");

        if (user.image) await CloudinaryUtil.deleteFile(user.image);

        await UserModel.deleteOne({ _id: userId });

        return user;
    }
}

export default new UserService();
