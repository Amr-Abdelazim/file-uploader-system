import CustomError from "../utils/CustomError.js";
import jwt from "jsonwebtoken";


async function verifyToken(req, res, next) {
    const header = req.headers['authorization'];
    if (!header)
        next(new CustomError("Authorization header missing", 400));
    const [bearer, accessToken] = header.split(' ');
    if (!bearer || !accessToken || bearer !== 'Bearer')
        next(new CustomError("Invalid header format", 400));

    try {
        const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = user;
        next();
    }
    catch (err) {
        next(new CustomError("Invalid or expired token", 401));
    }
}

export default { verifyToken };