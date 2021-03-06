const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, payload) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.payload = payload;
    this.from = `MovieSearch Service <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // Sendgrid
    if (process.env.NODE_ENV === 'production') {
      console.log('The mail has been sent by Sendgrid');
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      payload: this.payload,
      subject
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Добро пожаловать в MoveSearch!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Ваш пятизначный ключ для смены пароля (действителен только в течение 10 минут)'
    );
  }
};



