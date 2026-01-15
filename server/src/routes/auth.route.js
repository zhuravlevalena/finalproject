const AuthController = require('../controller/auth.controller');

const authRouter = require('express').Router();

authRouter.post('/register', AuthController.registration);
authRouter.post('/login', AuthController.login)
authRouter.get('/refresh', AuthController.refresh)
authRouter.delete('/logout', AuthController.logout)

module.exports = authRouter;