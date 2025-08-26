import { Router } from "express";
import asyncHandler from "express-async-handler";
import AuthController from '../controllers/AuthController.js';
import AuthValidation from "../middlewares/validations/AuthValidation.js";


const router = Router();

router.post('/signup', AuthValidation.validateSignup(), asyncHandler(AuthController.signup));
router.post('/login', AuthValidation.validateLogin(), asyncHandler(AuthController.login));
router.post('/token', asyncHandler(AuthController.refreshToken));
router.post('/logout', asyncHandler(AuthController.logout));


export default router;