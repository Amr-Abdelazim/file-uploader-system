import validate from "./validate.js";
import { body, param } from "express-validator";
import userService from "../../services/userService.js";

function validateFolder(viewerOnly = true) {
    const validations = [
        param("folderId")
            .trim()
            .custom(async (value, { req }) => {
                if (!value) throw new Error("folderId required");
                const ok = viewerOnly
                    ? await userService.isMyFolder(req.user.userId, value)
                    : await userService.canEditFolder(req.user.userId, value);
                if (!ok) throw new Error("Invalid FolderId");
                return true;
            }),
    ];

    return validate(validations);
}

function validateCreateFolder() {
    const validations = [
        body('name')
            .notEmpty()
            .withMessage('name is required'),
        body('parentId')
            .optional()
            .isString()
            .withMessage('parentId must be a string')
            .bail()
            .custom(async (value, { req }) => {
                if (!await userService.canEditFolder(req.user.userId, value)) {
                    throw new Error('Invalid parentId');
                }
                return true;
            })
    ];
    return validate(validations);
}

export default { validateFolder, validateCreateFolder };