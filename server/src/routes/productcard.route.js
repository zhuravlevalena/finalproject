const ProductCardController = require('../controller/productcard.controller');
const verifyAccessToken = require('../middlewares/verifyAccessToken');
const productCardRouter = require('express').Router();
const multer = require('multer');

productCardRouter.use(verifyAccessToken);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

productCardRouter.get('/', verifyAccessToken, ProductCardController.getAllCards);
productCardRouter.get('/:id', verifyAccessToken,ProductCardController.getCardById);
productCardRouter.post('/', verifyAccessToken, upload.single('image'),ProductCardController.createCard);
productCardRouter.put('/:id', verifyAccessToken, upload.single('image'), ProductCardController.updateCard);
productCardRouter.delete('/:id', verifyAccessToken, ProductCardController.deleteCard);

module.exports = productCardRouter;
