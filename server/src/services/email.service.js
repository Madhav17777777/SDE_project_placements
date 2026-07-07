// Thin wrapper around Nodemailer. If SMTP credentials aren't configured
// (e.g. running locally without a real mail provider), we log the email
// content instead of throwing — so signup/forgot-password flows are fully
// exercisable in local dev without needing a SendGrid/Gmail account.

import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const hasSmtpConfig = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : null;

const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    logger.info(`[email:dev-mode] To: ${to} | Subject: ${subject}\n${html}`);
    return;
  }
  await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html });
};

export const sendVerificationEmail = async (user, rawToken) => {
  const link = `${env.CLIENT_URL}/verify-email/${rawToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your StreamVerse account',
    html: `<p>Hi ${user.fullName},</p><p>Confirm your email to finish setting up StreamVerse:</p><p><a href="${link}">${link}</a></p><p>This link expires in 24 hours.</p>`,
  });
};

export const sendPasswordResetEmail = async (user, rawToken) => {
  const link = `${env.CLIENT_URL}/reset-password/${rawToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your StreamVerse password',
    html: `<p>Hi ${user.fullName},</p><p>Reset your password using the link below:</p><p><a href="${link}">${link}</a></p><p>This link expires in 30 minutes. If you didn't request this, ignore this email.</p>`,
  });
};
