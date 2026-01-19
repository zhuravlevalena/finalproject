const { User } = require('../../db/models')

class UserService {
  

  static async createUser(data) {
      return User.create(data);
  }

  static async updateUser(id, data) {
      const user = await User.findByPk(id);
      if (!user) {
        return null;
      }
      return user.update(data);
  }

  static async deleteUser(id) {
      await User.destroy({ where: { id } });
      return true;
  }

}

module.exports = UserService;