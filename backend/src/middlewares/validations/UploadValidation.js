import validate from "./validate.js";
import { body, param } from "express-validator";
import userService from "../../services/userService.js";


function fileUpload() {
    const validations = [
        param("folderId")
            .trim()
            .custom(async (value, { req }) => {

                if (!value) throw new Error("folderId required");
                if (!await userService.isMyFolder(req.user.userId, value))
                    throw new Error("Invalid FolderId");
                return true;
            }),


    ];



    return validate(validations);
}

export default { fileUpload };