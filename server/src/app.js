const express = require('express');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport.config');

const authRouter = require('./routes/auth.route');
const marketplaceRouter = require('./routes/marketplace.route');
const productCardRouter = require('./routes/productcard.route');
const productProfileRouter = require('./routes/productprofile.route');
const templateRouter = require('./routes/template.route');
const layoutRouter = require('./routes/layout.route');
const imageRouter = require('./routes/image.route');
const aiRouter = require('./routes/ai.route');
const userRouter = require('./routes/user.route');
const cookieParser = require('cookie-parser');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Middleware для CORS заголовков для статических файлов
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // !!!

app.use('/img', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use('/img', express.static(path.join(__dirname, 'img')));

app.use('/api/auth', authRouter);
app.use('/api/marketplaces', marketplaceRouter);
app.use('/api/product-cards', productCardRouter);
app.use('/api/product-profiles', productProfileRouter);
app.use('/api/templates', templateRouter);
app.use('/api/layouts', layoutRouter);
app.use('/api/images', imageRouter);
// app.use('/api/card-versions', cardVersionRouter); // TODO: Enable when route file is created
app.use('/api/ai', aiRouter);
app.use('/api/users', userRouter);

app.use((err, req, res, next) => {
  console.log(err);
  res.sendStatus(500);
});

module.exports = app;
