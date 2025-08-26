import { body } from 'express-validator';
import validate from './validate.js';


function validateLogin() {

    const validations = [
        body()
            .custom((value, { req }) => {
                if (!req.body.username && !req.body.email) {
                    throw new Error("Either username or email is required");
                }
                return true;
            }),
        body("username")
            .optional()
            .trim()
            .matches(/^(?=.*[a-zA-Z])[a-zA-Z0-9_]+$/)
            .withMessage(
                "Username must contain only letters, numbers, underscore, and at least one letter"
            )
            .isLength({ min: 3 })
            .withMessage("Username must be at least 3 characters"),

        body("email")
            .optional()
            .isEmail()
            .withMessage("Invalid email address"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters"),

    ];
    return validate(validations);
}

function validateSignup() {
    const validations = [
        // Username: required, letters/numbers/underscore, at least one letter, min 3 chars
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .matches(/^(?=.*[a-zA-Z])[a-zA-Z0-9_]+$/)
            .withMessage("Username must contain only letters, numbers, underscore, and at least one letter")
            .isLength({ min: 3 })
            .withMessage("Username must be at least 3 characters"),

        // Email: required, valid format
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email address"),

        // Password: required, min 8 chars
        body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters"),

        // Confirm password: required, must match password
        body("confirmPassword")
            .notEmpty()
            .withMessage("Confirm password is required")
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("Passwords do not match");
                }
                return true;
            }),
    ];

    return validate(validations);
}


export default { validateLogin, validateSignup };