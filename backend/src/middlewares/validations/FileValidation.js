import validate from "./validate.js";
import { body, param } from "express-validator";
import userService from "../../services/userService.js";


function validateFile() {
    const validations = [
        param("fileId")
            .trim()
            .custom(async (value, { req }) => {

                if (!value) throw new Error("fileId required");
                if (!await userService.isMyFile(req.user.userId, value))
                    throw new Error("Invalid FileId");
                return true;
            }),


    ];



    return validate(validations);
}

export default { validateFile };