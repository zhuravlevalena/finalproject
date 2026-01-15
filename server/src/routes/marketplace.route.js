const MarketplaceController = require('../controller/marketplace.controller');
const marketplaceRouter = require('express').Router();

marketplaceRouter.get('/', MarketplaceController.getAllMarketplaces);
marketplaceRouter.get('/:id', MarketplaceController.getMarketplaceById);

module.exports = marketplaceRouter;
