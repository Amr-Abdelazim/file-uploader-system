import validate from "./validate.js";
import { body } from "express-validator";
import userService from "../../services/userService.js";
import CustomError from "../../utils/CustomError.js";
function validateStartSession() {

    const validations = [

        body("name")
            .notEmpty()
            .withMessage("name is required"),

        body("size")
            .isInt({ min: 1 })
            .withMessage("size must be greater than 0"),

        body("totalChunks")
            .isInt({ min: 1 })
            .withMessage("totalChunks must be greater than 0"),

        body("folderId")
            .notEmpty()
            .withMessage("folderId is required"),

        body("mimetype")
            .notEmpty()
            .withMessage("mimetype is required")
            .bail()
            .matches(/^[a-zA-Z0-9.-]+\/[a-zA-Z0-9.+-]+$/)
            .withMessage("invalid mimetype"),

        body("resourceType")
            .optional()
            .isString()
            .withMessage("resourceType must be string")

    ];

    return validate(validations);
}

function validateChunk() {

    const validations = [

        body("sessionId")
            .notEmpty()
            .withMessage("sessionId is required")
            .isString()
            .withMessage("sessionId must be a string"),

        body("chunkIndex")
            .notEmpty()
            .withMessage("chunkIndex is required")
            .isInt({ min: 0 })
            .withMessage("chunkIndex must be a number >= 0")
            .toInt(),

        body("size")
            .notEmpty()
            .withMessage("size is required")
            .isInt({ min: 0 })
            .withMessage("size must be a number >= 0")
            .toInt(),

        body("chunkHash")
            .optional()
            .isString()
            .withMessage("chunkHash must be a string"),


    ];

    return validate(validations);
}

function validateFinalize() {
    const validations = [
        body("sessionId")
            .notEmpty()
            .withMessage("sessionId is required")
            .isString()
            .withMessage("sessionId must be a string"),
    ];

    return validate(validations);
}

export default {
    validateStartSession,
    validateChunk,
    validateFinalize
};