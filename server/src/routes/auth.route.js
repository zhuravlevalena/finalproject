const AuthController = require('../controller/auth.controller');
const verifyAccessToken = require('../middlewares/verifyAccessToken');

const authRouter = require('express').Router();

authRouter.post('/register', AuthController.registration);
authRouter.post('/login', AuthController.login);
authRouter.get('/refresh', AuthController.refresh);
authRouter.delete('/logout', AuthController.logout);

// Google OAuth routes
authRouter.get('/google', AuthController.googleAuth);
authRouter.get('/google/callback', AuthController.googleCallback);

// Email verification routes
authRouter.get('/verify-email', AuthController.verifyEmail); // Для обратной совместимости (ссылка)
authRouter.post('/verify-email-code', AuthController.verifyEmailCode); // Проверка кода
authRouter.post('/resend-verification-code', AuthController.resendVerificationCode); // Повторная отправка кода
authRouter.post('/resend-verification', verifyAccessToken, AuthController.resendVerificationEmail); // Для авторизованных пользователей

module.exports = authRouter;