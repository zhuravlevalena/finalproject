const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');

function generateTokens(payload) {
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, jwtConfig.access)
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, jwtConfig.refresh)

  return { accessToken, refreshToken }
}

module.exports = generateTokens;