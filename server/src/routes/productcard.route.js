const ProductCardController = require('../controller/productcard.controller');
const verifyAccessToken = require('../middlewares/verifyAccessToken');
const productCardRouter = require('express').Router();

productCardRouter.use(verifyAccessToken);

productCardRouter.get('/', ProductCardController.getAllCards);
productCardRouter.get('/:id', ProductCardController.getCardById);
productCardRouter.post('/', ProductCardController.createCard);
productCardRouter.put('/:id', ProductCardController.updateCard);
productCardRouter.delete('/:id', ProductCardController.deleteCard);

module.exports = productCardRouter;
