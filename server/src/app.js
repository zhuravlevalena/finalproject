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
const imageRouter = require('./routes/image.route');
const aiRouter = require('./routes/ai.route')
const cookieParser = require('cookie-parser');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Session configuration for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Статические файлы для загруженных изображений
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRouter);
app.use('/api/marketplaces', marketplaceRouter);
app.use('/api/product-cards', productCardRouter);
app.use('/api/product-profiles', productProfileRouter);
app.use('/api/templates', templateRouter);
app.use('/api/images', imageRouter);
app.use('/api/ai',aiRouter)


// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.log(err);
  res.sendStatus(500)
});

module.exports = app;