const TemplateController = require('../controller/template.controller');
const templateRouter = require('express').Router();

templateRouter.get('/', TemplateController.getAllTemplates);
templateRouter.get('/:id', TemplateController.getTemplateById);

module.exports = templateRouter;
