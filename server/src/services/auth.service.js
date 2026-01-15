const { User } = require('../../db/models');
const bcrypt = require('bcrypt');

class AuthService {
  static async register({ name, email, password }) {
    if (!email || !password) {
      throw new Error('email and password are required');
    }

    const hashpass = await bcrypt.hash(password, 10);

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: { name, hashpass },
    });

    if (!created) {
      throw new Error('this email is taken');
    }

    const plainUser = user.get();
    delete plainUser.hashpass;
    return plainUser;
  }

  static async login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const valid = await bcrypt.compare(password, user.hashpass);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    const plainUser = user.get();
    delete plainUser.hashpass;
    return plainUser;
  }
}

module.exports = AuthService;
