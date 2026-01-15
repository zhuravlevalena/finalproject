const jwtConfig = require("./jwt.config");

module.exports = {
  refresh: {
    maxAge: jwtConfig.refresh.expiresIn,
    httpOnly: true
  }
}