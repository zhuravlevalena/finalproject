const express = require('express');
const morgan = require('morgan');
const path = require('path');

const authRouter = require('./routes/auth.route');
const marketplaceRouter = require('./routes/marketplace.route');
const productCardRouter = require('./routes/productcard.route');
const productProfileRouter = require('./routes/productprofile.route');
const templateRouter = require('./routes/template.route');
const imageRouter = require('./routes/image.route');
const cookieParser = require('cookie-parser');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Статические файлы для загруженных изображений
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRouter);
app.use('/api/marketplaces', marketplaceRouter);
app.use('/api/product-cards', productCardRouter);
app.use('/api/product-profiles', productProfileRouter);
app.use('/api/templates', templateRouter);
app.use('/api/images', imageRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.log(err);
  res.sendStatus(500)
});

module.exports = app;