const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  static transporter = null;

  /**
   * Инициализация транспорта для отправки email
   */
  static init() {
    if (this.transporter) {
      return this.transporter;
    }

    // Проверяем наличие обязательных переменных окружения
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env file');
      console.error('Current SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'NOT SET');
      console.error('Current SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
      return null;
    }

    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true для 465, false для других портов
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    console.log('Initializing SMTP transporter with config:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.auth.user,
      pass: smtpConfig.auth.pass ? '***' : 'NOT SET',
    });

    try {
      this.transporter = nodemailer.createTransport(smtpConfig);
      console.log('SMTP transporter initialized successfully');
      return this.transporter;
    } catch (error) {
      console.error('Failed to initialize SMTP transporter:', error);
      return null;
    }
  }

  /**
   * Генерирует 6-значный код для подтверждения email
   */
  static generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-значный код
  }

  /**
   * Отправляет письмо с кодом подтверждения email
   */
  static async sendVerificationEmail(email, name, code) {
    try {
      console.log('Attempting to send verification email to:', email);
      const transporter = this.init();

      if (!transporter) {
        const error = new Error('Email transporter not configured. Please check SMTP settings in .env file');
        console.error(error.message);
        throw error;
      }

      console.log('Verification code:', code);

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'AI-Ассистент'}" <${
          process.env.SMTP_USER
        }>`,
        to: email,
        subject: 'Код подтверждения регистрации',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
              .code { font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; color: #4F46E5; background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #4F46E5; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Добро пожаловать, ${name}!</h1>
              </div>
              <div class="content">
                <p>Спасибо за регистрацию в AI-Ассистент!</p>
                <p>Для завершения регистрации и активации вашего аккаунта, пожалуйста, введите следующий код подтверждения в форме регистрации:</p>
                <div class="code">${code}</div>
                <p><strong>Важно:</strong> Код действителен в течение 10 минут.</p>
                <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} AI-Ассистент. Все права защищены.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Добро пожаловать, ${name}!
          
          Спасибо за регистрацию в AI-Ассистент!
          
          Для завершения регистрации и активации вашего аккаунта, пожалуйста, введите следующий код подтверждения в форме регистрации:
          
          ${code}
          
          Код действителен в течение 10 минут.
          
          Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.
        `,
      };

      console.log('Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
      });

      const info = await transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected,
      });
      return info;
    } catch (error) {
      console.error('Error sending verification email:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        stack: error.stack,
      });
      throw new Error(`Failed to send verification email: ${error.message}`, { cause: error });
    }
  }

  /**
   * Отправляет письмо для сброса пароля
   */
  static async sendPasswordResetEmail(email, name, token) {
    try {
      const transporter = this.init();

      if (!transporter) {
        throw new Error('Email transporter not configured');
      }

      const resetUrl = `${
        process.env.CLIENT_URL || 'http://localhost:5173'
      }/reset-password?token=${token}`;

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'AI-Ассистент'}" <${
          process.env.SMTP_USER
        }>`,
        to: email,
        subject: 'Сброс пароля',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
              .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Сброс пароля</h1>
              </div>
              <div class="content">
                <p>Здравствуйте, ${name}!</p>
                <p>Вы запросили сброс пароля для вашего аккаунта.</p>
                <p>Для установки нового пароля нажмите на кнопку ниже:</p>
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Сбросить пароль</a>
                </div>
                <p>Или скопируйте и вставьте следующую ссылку в браузер:</p>
                <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
                <p><strong>Важно:</strong> Ссылка действительна в течение 1 часа.</p>
                <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} AI-Ассистент. Все права защищены.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

module.exports = EmailService;
