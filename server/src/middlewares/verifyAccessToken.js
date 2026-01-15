const jwt = require('jsonwebtoken');

function verifyAccessToken(req, res, next) {
  try {
    if (!req.headers.authorization) {
      return res.sendStatus(401);
    }

    const accessToken = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    
    // Токен создается как { user: {...} }, поэтому извлекаем user
    const user = decoded.user || decoded;
    
    // Убеждаемся, что у пользователя есть id
    if (!user || !user.id) {
      console.error('Invalid user in token:', user);
      return res.sendStatus(403);
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.log('Token verification error:', err);
    return res.sendStatus(403);
  }
}

module.exports = verifyAccessToken;
