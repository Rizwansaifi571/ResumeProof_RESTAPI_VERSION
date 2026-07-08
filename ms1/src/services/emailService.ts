import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, 
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

export const sendEmailVerificationLink = async (to: string, rawToken: string) => {
  try {
    const link = `${env.DOCS_PORTAL_URL}/verify-email?token=${rawToken}`;
    
    if (env.NODE_ENV === 'development') {
      logger.info(`[DEV] Verification link for ${to}: ${link}`);
    }

    const mailOptions = {
      from: env.SMTP_FROM,
      to,
      subject: 'Verify your ResumeProof account',
      html: `
        <p>Welcome to ResumeProof!</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${link}">${link}</a>
        <p>This link expires in 24 hours.</p>
      `,
    };

    const mailer = getTransporter();
    await mailer.sendMail(mailOptions);
    logger.info(`Sent verification email to ${to}`);
  } catch (error) {
    logger.error(`Failed to send verification email to ${to}`, error);
    // Ignore error in development if dummy SMTP isn't working
    if (env.NODE_ENV !== 'development') {
      throw error;
    }
  }
};

export const sendPasswordResetEmail = async (to: string, rawToken: string) => {
  try {
    const link = `${env.DOCS_PORTAL_URL}/reset-password?token=${rawToken}`;
    
    if (env.NODE_ENV === 'development') {
      logger.info(`[DEV] Password reset link for ${to}: ${link}`);
    }

    const mailOptions = {
      from: env.SMTP_FROM,
      to,
      subject: 'Reset your ResumeProof password',
      html: `
        <p>Hello,</p>
        <p>You requested a password reset for your ResumeProof account. Click the link below to set a new password:</p>
        <a href="${link}">${link}</a>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    const mailer = getTransporter();
    await mailer.sendMail(mailOptions);
    logger.info(`Sent password reset email to ${to}`);
  } catch (error) {
    logger.error(`Failed to send password reset email to ${to}`, error);
    if (env.NODE_ENV !== 'development') {
      throw error;
    }
  }
};
