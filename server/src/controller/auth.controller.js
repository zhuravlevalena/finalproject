const cookieConfig = require('../config/cookie.config');
const AuthService = require('../services/auth.service');
const generateTokens = require('../utils/generateTokens');
const jwt = require('jsonwebtoken');

class AuthController {
  static async registration(req, res) {
    try {
      const data = req.body;
      const user = await AuthService.register(data);

      const { accessToken, refreshToken } = generateTokens({ user });

      res
        .status(201)
        .cookie('refreshToken', refreshToken, cookieConfig.refresh)
        .json({ user, accessToken });
    } catch (error) {
      console.error('Error during registration:', error);
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
}

module.exports = AuthController;
