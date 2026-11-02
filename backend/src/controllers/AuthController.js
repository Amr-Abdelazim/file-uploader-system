import AuthService from '../services/AuthService.js';
import jwt from 'jsonwebtoken';
import CustomError from '../utils/CustomError.js';

async function signup(req, res, next) {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    await AuthService.signup(username, email, password);
    res.status(201).json({ message: "Signup success" });
}

async function login(req, res, next) {
    const usernameOrEmail = req.body.username || req.body.email;
    const password = req.body.password;
    const user = await AuthService.login(usernameOrEmail, password);
    const access_token = jwt.sign(
        { userId: user.userId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' } // 1h just for testing
    );
    res.cookie("refresh_token", user.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict',
        maxAge: 3 * 60 * 60 * 1000 // 3h for testing
    });
    res.json({ access_token });
}
async function refreshToken(req, res, next) {
    if (!req.cookies)
        return next(new CustomError("Cookies missing", 400));
    if (!req.cookies.refresh_token)
        return next(new CustomError("Token missing", 400));
    const user = await AuthService.verifyRefreshToken(req.cookies.refresh_token);

    const access_token = jwt.sign(
        { userId: user.userId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' } // 1h just for testing
    );
    res.json({ access_token });
}
async function logout(req, res, next) {
    if (!req.cookies)
        return next(new CustomError("Cookies missing", 400));
    if (!req.cookies.refresh_token)
        return next(new CustomError("Token missing", 400));
    await AuthService.logout(req.cookies.refresh_token);
    res.json({ message: "logout success" });
}

export default { signup, login, logout, refreshToken }