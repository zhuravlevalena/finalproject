const ImageController = require('../controller/image.controller');
const verifyAccessToken = require('../middlewares/verifyAccessToken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const imageRouter = require('express').Router();

// Настройка multer для загрузки файлов
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

imageRouter.use(verifyAccessToken);

imageRouter.post('/upload', upload.single('image'), ImageController.uploadImage);
imageRouter.get('/', ImageController.getAllImages);
imageRouter.get('/:id', ImageController.getImageById);
imageRouter.delete('/:id', ImageController.deleteImage);

module.exports = imageRouter;
