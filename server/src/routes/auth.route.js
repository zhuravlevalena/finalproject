const AuthController = require('../controller/auth.controller');

const authRouter = require('express').Router();

authRouter.post('/register', AuthController.registration);
authRouter.post('/login', AuthController.login);
authRouter.get('/refresh', AuthController.refresh);
authRouter.delete('/logout', AuthController.logout);

// Google OAuth routes
authRouter.get('/google', AuthController.googleAuth);
authRouter.get('/google/callback', AuthController.googleCallback);

module.exports = authRouter;