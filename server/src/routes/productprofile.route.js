const ProductProfileController = require('../controller/productprofile.controller');
const verifyAccessToken = require('../middlewares/verifyAccessToken');
const productProfileRouter = require('express').Router();

productProfileRouter.use(verifyAccessToken);

productProfileRouter.get('/', ProductProfileController.getAllProfiles);
productProfileRouter.get('/:id', ProductProfileController.getProfileById);
productProfileRouter.post('/get-or-create', ProductProfileController.getOrCreateProfile);
productProfileRouter.put('/:id', ProductProfileController.updateProfile);
productProfileRouter.delete('/:id', ProductProfileController.deleteProfile);

module.exports = productProfileRouter;
