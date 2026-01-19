const aiRouter = require('express').Router()
const aiController = require('../controller/ai.controller')
const verifyAccessToken = require('../middlewares/verifyAccessToken')

aiRouter.post('/ask',verifyAccessToken,aiController.ask)

module.exports = aiRouter