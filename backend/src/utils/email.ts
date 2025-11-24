import nodemailer from 'nodemailer';
import { logger } from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@university.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}`);
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string, userName: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p>${resetUrl}</p>
            <p><strong>This link will expire in 15 minutes.</strong></p>
            <p>If you didn't request a password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>University Management Platform</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'Password Reset Request',
      html,
    });
  }

  async sendAbsenceWarningEmail(to: string, userName: string, absenceCount: number, subjectName: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 10px; margin: 10px 0; }
          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Absence Warning</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <div class="warning">
              <p><strong>You currently have ${absenceCount} unexcused absence(s) for ${subjectName}.</strong></p>
            </div>
            <p>Please be aware that accumulating too many absences may result in elimination from the course.</p>
            <p>If you have a valid reason for your absence, please submit an excuse request through the platform.</p>
          </div>
          <div class="footer">
            <p>University Management Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: '⚠️ Absence Warning - Action Required',
      html,
    });
  }

  async sendEliminationRiskEmail(to: string, userName: string, absenceCount: number, maxAllowed: number): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .danger { background-color: #ffebee; border-left: 4px solid #f44336; padding: 10px; margin: 10px 0; }
          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 URGENT: Elimination Risk</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <div class="danger">
              <p><strong>CRITICAL WARNING: You have ${absenceCount} absences out of a maximum of ${maxAllowed} allowed.</strong></p>
              <p><strong>You are at risk of being eliminated from the course!</strong></p>
            </div>
            <p>Please take immediate action:</p>
            <ul>
              <li>Submit excuse requests for any justified absences</li>
              <li>Contact your teacher or department head</li>
              <li>Ensure perfect attendance going forward</li>
            </ul>
          </div>
          <div class="footer">
            <p>University Management Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: '🚨 URGENT: Elimination Risk - Immediate Action Required',
      html,
    });
  }
}

export const emailService = new EmailService();
