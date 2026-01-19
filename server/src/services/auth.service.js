const { User } = require('../../db/models');
const bcrypt = require('bcrypt');
const EmailService = require('./email.service');

class AuthService {
  static async register({ name, email, password }) {
    console.log('AuthService.register called with:', { name, email, password: '***' });
    
    if (!email || !password) {
      console.log('Validation failed: email and password are required');
      throw new Error('email and password are required');
    }

    if (!name || name.trim() === '') {
      console.log('Validation failed: name is required');
      throw new Error('name is required');
    }

    console.log('Hashing password...');
    const hashpass = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    
    console.log('Generating verification code...');
    const verificationCode = EmailService.generateVerificationCode();
    const verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут
    console.log('Verification code generated:', verificationCode);

    console.log('Creating user in database...');
    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: { 
        name: name.trim(), 
        hashpass, 
        emailVerified: false,
        verificationToken: verificationCode, // Сохраняем код в verificationToken
        verificationTokenExpires,
      },
    });

    if (!created) {
      console.log('User creation failed: email already taken');
      throw new Error('this email is taken');
    }

    console.log('User created successfully:', { id: user.id, email: user.email });

    // Отправляем письмо с кодом подтверждения
    console.log('=== EMAIL SENDING START ===');
    try {
      console.log('Sending verification email to:', user.email);
      await EmailService.sendVerificationEmail(user.email, user.name, verificationCode);
      console.log('=== EMAIL SENDING SUCCESS ===');
      console.log('Verification email sent successfully to:', user.email);
    } catch (error) {
      console.error('=== EMAIL SENDING ERROR ===');
      console.error('Failed to send verification email:', {
        email: user.email,
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        stack: error.stack,
      });
      // Не прерываем регистрацию, если не удалось отправить email
      // Но логируем ошибку для диагностики
    }

    const plainUser = user.get();
    delete plainUser.hashpass;
    delete plainUser.verificationToken; // Не возвращаем токен
    return plainUser;
  }

  /**
   * Подтверждает email по коду
   */
  static async verifyEmailCode(email, code) {
    const user = await User.findOne({
      where: {
        email,
        verificationToken: code,
        verificationTokenExpires: {
          [require('sequelize').Op.gt]: new Date(), // Код не истек
        },
      },
    });

    if (!user) {
      // Проверяем, может код истек
      const expiredUser = await User.findOne({
        where: { 
          email,
          verificationToken: code,
        },
      });
      
      if (expiredUser) {
        throw new Error('Код подтверждения истек. Пожалуйста, запросите новый код.');
      }
      
      throw new Error('Неверный код подтверждения');
    }

    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    const plainUser = user.get();
    delete plainUser.hashpass;
    return plainUser;
  }

  /**
   * Подтверждает email по токену (для обратной совместимости)
   */
  static async verifyEmail(token) {
    const user = await User.findOne({
      where: {
        verificationToken: token,
        verificationTokenExpires: {
          [require('sequelize').Op.gt]: new Date(), // Токен не истек
        },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    const plainUser = user.get();
    delete plainUser.hashpass;
    return plainUser;
  }

  /**
   * Повторно отправляет письмо с кодом подтверждения
   */
  static async resendVerificationEmail(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email already verified');
    }

    const verificationCode = EmailService.generateVerificationCode();
    const verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    user.verificationToken = verificationCode;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    await EmailService.sendVerificationEmail(user.email, user.name, verificationCode);

    return { message: 'Verification email sent' };
  }

  /**
   * Повторно отправляет код подтверждения по email (для формы регистрации)
   */
  static async resendVerificationCodeByEmail(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email already verified');
    }

    const verificationCode = EmailService.generateVerificationCode();
    const verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    user.verificationToken = verificationCode;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    await EmailService.sendVerificationEmail(user.email, user.name, verificationCode);

    return { message: 'Verification code sent' };
  }

  static async login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Проверяем, что у пользователя есть пароль (не зарегистрирован через Google)
    if (!user.hashpass) {
      throw new Error('This account is registered with Google. Please use Google sign-in.');
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