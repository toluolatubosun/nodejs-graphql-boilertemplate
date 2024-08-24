import { z } from "zod";
import CloudinaryUtil from "@/libraries/cloudinary";
import UserModel, { IUser } from "@/models/user.model";
import CustomError from "@/utilities/graphql/custom-error";
import { extractZodError } from "@/utilities/helpful-methods";

class UserService {
    async create(input: Object) {
        const { error, data } = z
            .object({
                input: z.object({
                    name: z.string().trim(),
                    email: z.string().email().trim(),
                    role: z.string().trim().optional(),
                    image: z.string().trim().optional(),
                    password: z.string().min(6).trim(),
                }),
            })
            .safeParse({ input });
        if (error) throw new CustomError(extractZodError(error));

        if (data.input.image) {
            const uploadResult = await CloudinaryUtil.uploadBase64(data.input.image, "users");
            data.input.image = uploadResult.secure_url;
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

    async update(userId: string, input: Object) {
        const { error, data } = z
            .object({
                input: z.object({
                    name: z.string().trim().optional(),
                    image: z.string().trim().optional(),
                }),
            })
            .safeParse({ input });
        if (error) throw new CustomError(extractZodError(error));

        const user = await UserModel.findOne({ _id: userId });
        if (!user) throw new CustomError("user not found");

        const updateContext: Record<string, any> = {
            name: data.input.name,
            image: data.input.image,
        };

        if (data.input.image) {
            const uploadedImage = await CloudinaryUtil.uploadBase64(data.input.image, "users");
            updateContext.image = uploadedImage.secure_url;

            if (user.image) await CloudinaryUtil.deleteFile(user.image);
        }

        await UserModel.updateOne({ _id: userId }, { $set: updateContext });

        return { id: user.id, ...user.toObject(), ...updateContext } as IUser;
    }

    async delete(userId: string) {
        const user = await UserModel.findOneAndDelete({ _id: userId });
        if (user && user.image) await CloudinaryUtil.deleteFile(user.image);
        if (!user) throw new CustomError("User not found");

        return user;
    }
}

export default new UserService();
