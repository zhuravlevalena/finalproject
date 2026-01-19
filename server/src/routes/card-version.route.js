const express = require('express');
const router = express.Router();
const CardVersionController = require('../controller/card-version.controller');
const verifyAccessToken = require('../middlewares/verifyAccessToken');

// Получить все версии карточки
router.get('/card/:cardId', verifyAccessToken, CardVersionController.getVersions);

// Получить конкретную версию
router.get('/:versionId', verifyAccessToken, CardVersionController.getVersion);

// Создать новую версию
router.post('/card/:cardId', verifyAccessToken, CardVersionController.createVersion);

// Восстановить версию
router.post('/:versionId/restore', verifyAccessToken, CardVersionController.restoreVersion);

// Сравнить версии
router.get('/compare', verifyAccessToken, CardVersionController.compareVersions);

// Автосохранение
router.post('/card/:cardId/autosave', verifyAccessToken, CardVersionController.autoSave);

module.exports = router;
