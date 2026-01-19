const cookieConfig = require('../config/cookie.config');
const AuthService = require('../services/auth.service');
const generateTokens = require('../utils/generateTokens');
const jwt = require('jsonwebtoken');

class AuthController {
  static async registration(req, res) {
    try {
      const data = req.body;
      console.log('=== REGISTRATION START ===');
      console.log('Registration attempt with data:', { 
        name: data.name, 
        email: data.email, 
        password: data.password ? '***' : undefined 
      });
      
      // Валидация обязательных полей
      if (!data.name || !data.email || !data.password) {
        console.log('Registration failed: Missing required fields');
        return res.status(400).json({ 
          error: 'Missing required fields. Name, email, and password are required.' 
        });
      }

      console.log('Calling AuthService.register...');
      const user = await AuthService.register(data);
      console.log('User registered successfully:', { id: user.id, email: user.email });

      // При регистрации по коду, токены не выдаются сразу, а только после верификации
      // Поэтому здесь не генерируем токены и не устанавливаем куки.
      // Клиент будет ждать верификации.
      res.status(201).json({ message: 'Registration successful. Please verify your email.' });
      
      console.log('=== REGISTRATION SUCCESS ===');
    } catch (error) {
      console.error('=== REGISTRATION ERROR ===');
      console.error('Error during registration:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      return res.status(400).json({ error: error.message || 'Registration failed' });
    }
  }

  static async refresh(req, res) {
    try {
      const { refreshToken: oldRefreshToken } = req.cookies;
      
      if (!oldRefreshToken) {
        return res.status(401).json({ error: 'Refresh token not provided' });
      }
      
      const decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
      const tokenUser = decoded.user || decoded;
      
      // Получаем актуального пользователя из базы данных
      const { User } = require('../../db/models');
      const user = await User.findByPk(tokenUser.id);
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      const plainUser = user.get();
      delete plainUser.hashpass;
      delete plainUser.twoFactorSecret; // Не возвращаем секрет
      
      const { accessToken, refreshToken } = generateTokens({ user: plainUser });
      res
        .cookie('refreshToken', refreshToken, cookieConfig.refresh)
        .json({ user: plainUser, accessToken });
    } catch (err) {
      // Если токен невалидный (истек, неправильная подпись и т.д.)
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }
      console.error('Error during refresh:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static logout = async (req, res) => {
    res.clearCookie('refreshToken').sendStatus(204);
  };

  static login = async (req, res) => {
    try {
      const user = await AuthService.login(req.body);

      const { accessToken, refreshToken } = generateTokens({ user });

      res
        .cookie('refreshToken', refreshToken, cookieConfig.refresh)
        .json({ user, accessToken });
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(401).json({ error: error.message || 'Invalid email or password' });
    }
  };

  static googleAuth = (req, res, next) => {
    const passport = require('../config/passport.config');
    passport.authenticate('google', {
      scope: ['profile', 'email'],
    })(req, res, next);
  };

  static googleCallback = async (req, res, next) => {
    const passport = require('../config/passport.config');
    passport.authenticate('google', async (err, user) => {
      if (err) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(err.message)}`);
      }

      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=Authentication failed`);
      }

      try {
        const { accessToken, refreshToken } = generateTokens({ user });

        // Устанавливаем токены в cookie и редиректим на клиент
        res
          .cookie('refreshToken', refreshToken, cookieConfig.refresh)
          .redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${accessToken}`);
      } catch (error) {
        console.error('Error generating tokens:', error);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=Token generation failed`);
      }
    })(req, res, next);
  };

  static verifyEmailCode = async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: 'Email and verification code are required' });
      }

      const user = await AuthService.verifyEmailCode(email, code);
      const { accessToken, refreshToken } = generateTokens({ user });

      res
        .cookie('refreshToken', refreshToken, cookieConfig.refresh)
        .json({ 
          success: true, 
          message: 'Email verified successfully',
          user,
          accessToken
        });
    } catch (error) {
      console.error('Error verifying email code:', error);
      return res.status(400).json({ error: error.message || 'Failed to verify email code' });
    }
  };

  static resendVerificationCode = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      await AuthService.resendVerificationCodeByEmail(email);
      res.json({ message: 'Verification code sent successfully' });
    } catch (error) {
      console.error('Error resending verification code:', error);
      return res.status(400).json({ error: error.message || 'Failed to resend verification code' });
    }
  };

  static verifyEmail = async (req, res) => {
    try {
      const { token } = req.query;
      if (!token) {
        return res.status(400).json({ error: 'Verification token is required' });
      }

      const user = await AuthService.verifyEmail(token);
      res.json({ 
        success: true, 
        message: 'Email verified successfully',
        user 
      });
    } catch (error) {
      console.error('Error verifying email:', error);
      return res.status(400).json({ error: error.message || 'Failed to verify email' });
    }
  };

  static resendVerificationEmail = async (req, res) => {
    try {
      const userId = req.user.id;
      await AuthService.resendVerificationEmail(userId);
      res.json({ message: 'Verification email sent successfully' });
    } catch (error) {
      console.error('Error resending verification email:', error);
      return res.status(400).json({ error: error.message || 'Failed to resend verification email' });
    }
  };
}

module.exports = AuthController;
