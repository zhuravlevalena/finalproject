const { Router } = require('express');
const verifyAccessToken = require('../middlewares/verifyAccessToken');
const UserController = require('../controller/user.controller');

const userRouter = Router();

userRouter.use(verifyAccessToken);

userRouter.get('/me', UserController.getMe);
userRouter.put('/me', UserController.updateMe);

module.exports = userRouter;

