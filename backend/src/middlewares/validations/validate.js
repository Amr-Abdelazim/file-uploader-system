import { validationResult } from "express-validator";
import CustomError from "../../utils/CustomError.js";

function validate(validations) {

    return async (req, res, next) => {
        await Promise.all(validations.map(val => val.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(err => err.msg);
            next(new CustomError(errorMessages, 400));
        } else
            next();
    }
}

export default validate;