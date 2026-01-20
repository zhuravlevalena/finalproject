const { User } = require('../../db/models');
const UserService = require('../services/user.service');

class UserController {
  static async getMe(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const plain = user.get();
      delete plain.hashpass;
      delete plain.verificationToken;
      delete plain.verificationTokenExpires;

      return res.json(plain);
    } catch (error) {
      console.error('Error in getMe:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateMe(req, res) {
    try {
      const userId = req.user.id;
      const allowedFields = ['name', 'birthDate', 'gender', 'phone', 'email'];
      const data = {};

      allowedFields.forEach((field) => {
        if (typeof req.body[field] !== 'undefined') {
          data[field] = req.body[field];
        }
      });

      const updated = await UserService.updateUser(userId, data);

      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }

      const plain = updated.get();
      delete plain.hashpass;
      delete plain.verificationToken;
      delete plain.verificationTokenExpires;

      return res.json(plain);
    } catch (error) {
      console.error('Error in updateMe:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = UserController;

