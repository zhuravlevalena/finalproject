const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../../db/models');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails } = profile;
        const email = emails?.[0]?.value;

        if (!email) {
          return done(new Error('Email not provided by Google'), null);
        }

        // Ищем пользователя по googleId или email
        const { Op } = require('sequelize');
        let user = await User.findOne({
          where: {
            [Op.or]: [
              { googleId: id },
              { email: email },
            ],
          },
        });

        if (user) {
          // Если пользователь существует, обновляем googleId если нужно
          if (!user.googleId) {
            user.googleId = id;
            await user.save();
          }
        } else {
          // Создаем нового пользователя
          user = await User.create({
            name: displayName || email.split('@')[0],
            email,
            googleId: id,
            hashpass: null, // Пользователи через Google не имеют пароля
          });
        }

        const plainUser = user.get();
        delete plainUser.hashpass;
        return done(null, plainUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    if (user) {
      const plainUser = user.get();
      delete plainUser.hashpass;
      done(null, plainUser);
    } else {
      done(new Error('User not found'), null);
    }
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
