const LayoutController = require('../controller/layout.controller');
const layoutRouter = require('express').Router();

layoutRouter.get('/template/:templateId', LayoutController.getLayoutsByTemplateId);
layoutRouter.get('/:id', LayoutController.getLayoutById);
layoutRouter.post('/', LayoutController.createLayout);
layoutRouter.put('/:id', LayoutController.updateLayout);
layoutRouter.delete('/:id', LayoutController.deleteLayout);

module.exports = layoutRouter;
