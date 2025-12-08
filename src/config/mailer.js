// RF-R7 – Mailer con activación y reset password

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendActivationEmail(user, token) {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const activationUrl = `${baseUrl}/activate/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: "Activa tu cuenta en AppCenar",
    html: `
      <p>Hola ${user.nombre},</p>
      <p>Gracias por registrarte en AppCenar. Para activar tu cuenta haz clic en el siguiente enlace:</p>
      <p><a href="${activationUrl}">${activationUrl}</a></p>
      <p>Si tú no realizaste este registro, puedes ignorar este correo.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendResetPasswordEmail(user, token) {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/password/reset/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: "Restablecer contraseña - AppCenar",
    html: `
      <p>Hola ${user.nombre || user.username},</p>
      <p>Hemos recibido una solicitud para restablecer tu contraseña en AppCenar.</p>
      <p>Para continuar, haz clic en el siguiente enlace:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Este enlace es válido por 1 hora.</p>
      <p>Si tú no solicitaste este cambio, puedes ignorar este correo.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendActivationEmail, sendResetPasswordEmail };
