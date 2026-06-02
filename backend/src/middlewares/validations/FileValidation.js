import validate from "./validate.js";
import { body, param } from "express-validator";
import userService from "../../services/userService.js";

function validateFile(viewerOnly = true) {
    const validations = [
        param("fileId")
            .trim()
            .custom(async (value, { req }) => {
                if (!value) throw new Error("fileId required");
                const ok = viewerOnly
                    ? await userService.isMyFile(req.user.userId, value)
                    : await userService.canEditFile(req.user.userId, value);
                if (!ok) throw new Error("Invalid FileId");
                return true;
            }),
    ];

    return validate(validations);
}

function validateFileUpdate() {
    const validations = [
        param("fileId")
            .trim()
            .custom(async (value, { req }) => {
                if (!value) throw new Error("fileId required");
                if (!await userService.canEditFile(req.user.userId, value))
                    throw new Error("Invalid FileId");
                return true;
            }),
        body("name")
            .notEmpty()
            .withMessage("name is required")
    ];

    return validate(validations);
}

export default { validateFile, validateFileUpdate };