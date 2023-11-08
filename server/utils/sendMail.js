import nodemailer from 'nodemailer';
import nodemailerConfig from './nodemailerConfig.js';

export const sendEmail = async ({ to, subject, html }) => {
  let testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport(nodemailerConfig);
  return transporter.sendMail({
    from: '"Jnayana patisserie 👻" <jnayna@gmail.com>', // sender address
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}) => {
  const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;
  const message = `<p>Pour confirmer votre compte, veuillez cliquer sur le lien de confirmation ci-dessous :<a href="${verifyEmail}">Email</a></p>
                    <p>Si vous n'arrivez pas à cliquer sur le lien, vous pouvez le copier-coller dans la barre d'adresse de votre navigateur.</p>
                    <p>Assurez-vous de confirmer votre compte dans les [nombre de jours, par exemple, 7 jours] jours suivant la réception de ce message, sinon votre compte pourrait être désactivé.</p>
                    <p>Nous vous remercions de nous avoir rejoint et nous avons hâte de vous voir sur la boutique Jnayna.</p>
                    <p>Cordialement,</br>
                    L'équipe Jnayna</p>`;
  return sendEmail({
    to: email,
    subject: 'Email de confirmation de compte',
    html: `<h2>Hello ${name}</h2> ${message}`,
  });
};

export const sendResetPasswordEmail = async ({
  name,
  email,
  token,
  origin,
}) => {
  const resetURL = `${origin}/user/reset-password?token=${token}&email=${email}`;
  const message = `<p>Vous avez demandé la réinitialisation de votre mot de passe sur [Nom de l'Application]. Nous sommes là pour vous aider à sécuriser votre compte.</p>
                    <p>Pour réinitialiser votre mot de passe, veuillez cliquer sur le lien ci-dessous : :<a href="${resetURL}">resetURL</a></p>
                    <p>Si vous n'arrivez pas à cliquer sur le lien, vous pouvez le copier-coller dans la barre d'adresse de votre navigateur.
                    </p>
                    <p>Veuillez noter que ce lien de réinitialisation est valable pour 15mn. Après cette période, le lien expirera.
                    </p>
                    <p>Si vous n'avez pas demandé la réinitialisation de votre mot de passe, veuillez ignorer ce message ou nous en informer immédiatement en répondant à cet e-mail.</p>
                    <p>Nous vous remercions de nous avoir rejoint et nous avons hâte de vous voir sur la boutique Jnayna.</p>
                    <p>Cordialement,</br>
                    L'équipe Jnayna</p>`;
  return sendEmail({
    to: email,
    subject: 'Email de réinitialisation de mot de passe',
    html: `<h2>Hello ${name}</h2> ${message}`,
  });
};
