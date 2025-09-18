import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { TenantReference } from '@shared/schema';

// Email service configuration
interface EmailConfig {
  provider: 'sendgrid' | 'nodemailer';
  sendgridApiKey?: string;
  fromEmail: string;
  fromName: string;
}

// Email template types
export enum EmailType {
  REFERENCE_VERIFICATION = 'reference_verification',
  RENTCARD_REQUEST = 'rentcard_request',
  REFERRAL_NOTIFICATION = 'referral_notification',
  WELCOME_NEW_USER = 'welcome_new_user',
  FOLLOW_UP_REMINDER = 'follow_up_reminder'
}

// Email template data interfaces
interface ReferenceVerificationData {
  referenceName: string;
  tenantName: string;
  verificationUrl: string;
}

interface RentCardRequestData {
  prospectName: string;
  tenantName: string;
  propertyAddress: string;
  rentCardUrl: string;
  contactInfo: string;
}

interface ReferralNotificationData {
  referrerName: string;
  refereeName: string;
  rewardAmount?: string;
  referralLink: string;
}

interface WelcomeNewUserData {
  userName: string;
  userType: 'tenant' | 'landlord';
  dashboardUrl: string;
  referrerName?: string;
  rewardAmount?: string;
}

interface FollowUpReminderData {
  recipientName: string;
  actionRequired: string;
  actionUrl: string;
  daysRemaining?: number;
}

// Email template data union type
type EmailTemplateData = 
  | ReferenceVerificationData 
  | RentCardRequestData 
  | ReferralNotificationData 
  | WelcomeNewUserData 
  | FollowUpReminderData;

// Enhanced email service class
class EmailService {
  private config: EmailConfig;
  private nodemailerTransporter: nodemailer.Transporter | null = null;
  private isInitialized = false;

  constructor() {
    this.config = {
      provider: process.env.SENDGRID_API_KEY ? 'sendgrid' : 'nodemailer',
      sendgridApiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.EMAIL_FROM || 'noreply@myrentcard.com',
      fromName: process.env.EMAIL_FROM_NAME || 'MyRentCard'
    };
  }

  // Initialize the email service
  async initialize(): Promise<void> {
    try {
      if (this.config.provider === 'sendgrid' && this.config.sendgridApiKey) {
        // Initialize SendGrid
        sgMail.setApiKey(this.config.sendgridApiKey);
        console.log('Email service initialized with SendGrid');
      } else {
        // Fall back to Nodemailer (existing implementation)
        await this.initializeNodemailer();
        console.log('Email service initialized with Nodemailer fallback');
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      // Try to fall back to Nodemailer if SendGrid fails
      if (this.config.provider === 'sendgrid') {
        console.log('Falling back to Nodemailer due to SendGrid initialization failure');
        this.config.provider = 'nodemailer';
        await this.initializeNodemailer();
        this.isInitialized = true;
      } else {
        throw new Error(`Email service initialization failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // Initialize Nodemailer (existing logic from email.ts)
  private async initializeNodemailer(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      // Production email configuration
      this.nodemailerTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.example.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASSWORD || '',
        },
      });
      
      await this.nodemailerTransporter.verify();
      console.log('Production Nodemailer initialized successfully');
    } else {
      // Development email configuration using Ethereal
      const testAccount = await nodemailer.createTestAccount();
      this.nodemailerTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      
      await this.nodemailerTransporter.verify();
      console.log('Development Nodemailer initialized with Ethereal');
      console.log('Test email account created:', testAccount.user);
    }
  }

  // Send email with template
  async sendEmail(
    type: EmailType,
    to: string | string[],
    templateData: EmailTemplateData,
    options: {
      subject?: string;
      attachments?: any[];
      priority?: 'low' | 'normal' | 'high';
    } = {}
  ): Promise<{ success: boolean; info?: any; error?: any }> {
    if (!this.isInitialized) {
      throw new Error('Email service not initialized. Call initialize() first.');
    }

    try {
      const template = this.getEmailTemplate(type, templateData);
      const subject = options.subject || template.subject;

      if (this.config.provider === 'sendgrid' && this.config.sendgridApiKey) {
        return await this.sendWithSendGrid(to, subject, template.html, template.text, options);
      } else {
        return await this.sendWithNodemailer(to, subject, template.html, template.text, options);
      }
    } catch (error) {
      console.error(`Error sending ${type} email:`, error);
      return { success: false, error };
    }
  }

  // Send with SendGrid
  private async sendWithSendGrid(
    to: string | string[],
    subject: string,
    html: string,
    text: string,
    options: any
  ): Promise<{ success: boolean; info?: any; error?: any }> {
    try {
      const recipients = Array.isArray(to) ? to : [to];
      
      const msg = {
        to: recipients,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName
        },
        subject,
        text,
        html,
        attachments: options.attachments || []
      };

      // Add priority if specified
      if (options.priority && options.priority !== 'normal') {
        (msg as any).priority = options.priority;
      }

      const [response] = await sgMail.send(msg);
      console.log('SendGrid email sent successfully:', response.headers['x-message-id']);
      
      return { 
        success: true, 
        info: { 
          messageId: response.headers['x-message-id'],
          provider: 'sendgrid'
        }
      };
    } catch (error: any) {
      console.error('SendGrid send error:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('SendGrid error response:', error.response.body);
      }
      
      // Retry logic for rate limits
      if (error.code === 429) {
        console.log('SendGrid rate limit hit, falling back to Nodemailer');
        return await this.sendWithNodemailer(to, subject, html, text, options);
      }
      
      return { success: false, error };
    }
  }

  // Send with Nodemailer
  private async sendWithNodemailer(
    to: string | string[],
    subject: string,
    html: string,
    text: string,
    options: any
  ): Promise<{ success: boolean; info?: any; error?: any }> {
    try {
      if (!this.nodemailerTransporter) {
        throw new Error('Nodemailer transporter not initialized');
      }

      const recipients = Array.isArray(to) ? to.join(', ') : to;
      
      const mailOptions = {
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: recipients,
        subject,
        text,
        html,
        attachments: options.attachments || []
      };

      // Add priority if specified
      if (options.priority && options.priority !== 'normal') {
        (mailOptions as any).priority = options.priority;
      }

      const info = await this.nodemailerTransporter.sendMail(mailOptions);
      console.log('Nodemailer email sent:', info.messageId);
      
      // For development, log the preview URL
      if (process.env.NODE_ENV !== 'production') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('Preview URL:', previewUrl);
        }
      }
      
      return { 
        success: true, 
        info: { 
          ...info, 
          provider: 'nodemailer' 
        }
      };
    } catch (error) {
      console.error('Nodemailer send error:', error);
      return { success: false, error };
    }
  }

  // Get email template based on type and data
  private getEmailTemplate(type: EmailType, data: EmailTemplateData): { subject: string; html: string; text: string } {
    switch (type) {
      case EmailType.REFERENCE_VERIFICATION:
        return this.getReferenceVerificationTemplate(data as ReferenceVerificationData);
      
      case EmailType.RENTCARD_REQUEST:
        return this.getRentCardRequestTemplate(data as RentCardRequestData);
      
      case EmailType.REFERRAL_NOTIFICATION:
        return this.getReferralNotificationTemplate(data as ReferralNotificationData);
      
      case EmailType.WELCOME_NEW_USER:
        return this.getWelcomeNewUserTemplate(data as WelcomeNewUserData);
      
      case EmailType.FOLLOW_UP_REMINDER:
        return this.getFollowUpReminderTemplate(data as FollowUpReminderData);
      
      default:
        throw new Error(`Unknown email template type: ${type}`);
    }
  }

  // Reference verification template (enhanced existing)
  private getReferenceVerificationTemplate(data: ReferenceVerificationData): { subject: string; html: string; text: string } {
    const subject = `Reference Verification Request from ${data.tenantName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #4a6ee0 0%, #6c5ce7 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">MyRentCard</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Reference Verification</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #2d3748; margin: 0 0 20px 0;">Hello ${data.referenceName},</h2>
          <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
            <strong>${data.tenantName}</strong> has listed you as a reference on their MyRentCard profile. Your verification helps build trust in our rental community.
          </p>
          <p style="color: #4a5568; line-height: 1.6; margin: 0 0 30px 0;">
            Please take a moment to verify this reference by clicking the button below:
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.verificationUrl}" style="background: linear-gradient(135deg, #4a6ee0 0%, #6c5ce7 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(74, 110, 224, 0.3);">
              Verify Reference
            </a>
          </div>
          <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0;">
            This verification link will expire in 24 hours for security purposes.
          </p>
          <p style="color: #718096; font-size: 14px; margin: 10px 0 0 0;">
            If you did not expect this email, please disregard it.
          </p>
        </div>
        <div style="background-color: #f7fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #a0aec0; font-size: 12px; margin: 0;">
            This is an automated email from MyRentCard. Please do not reply to this message.
          </p>
        </div>
      </div>
    `;
    
    const text = `Hello ${data.referenceName},

${data.tenantName} has listed you as a reference on their MyRentCard profile.

Please verify this reference by visiting the following link:
${data.verificationUrl}

This verification link will expire in 24 hours.

If you did not expect this email, please disregard it.

Thank you for your time!

- The MyRentCard Team`;

    return { subject, html, text };
  }

  // RentCard request template
  private getRentCardRequestTemplate(data: RentCardRequestData): { subject: string; html: string; text: string } {
    const subject = `RentCard Application from ${data.tenantName} - ${data.propertyAddress}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">MyRentCard</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">New Application Received</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #2d3748; margin: 0 0 20px 0;">Hello ${data.prospectName},</h2>
          <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
            <strong>${data.tenantName}</strong> has submitted their RentCard application for your property at <strong>${data.propertyAddress}</strong>.
          </p>
          <p style="color: #4a5568; line-height: 1.6; margin: 0 0 30px 0;">
            Review their complete rental profile, verified references, and documents:
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.rentCardUrl}" style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);">
              View RentCard Application
            </a>
          </div>
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="color: #4a5568; margin: 0 0 10px 0; font-weight: 600;">Contact Information:</p>
            <p style="color: #718096; margin: 0; font-size: 14px;">${data.contactInfo}</p>
          </div>
        </div>
        <div style="background-color: #f7fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #a0aec0; font-size: 12px; margin: 0;">
            Sent via MyRentCard - Simplifying the rental process
          </p>
        </div>
      </div>
    `;
    
    const text = `Hello ${data.prospectName},

${data.tenantName} has submitted their RentCard application for your property at ${data.propertyAddress}.

Review their complete application here: ${data.rentCardUrl}

Contact Information: ${data.contactInfo}

- The MyRentCard Team`;

    return { subject, html, text };
  }

  // Referral notification template
  private getReferralNotificationTemplate(data: ReferralNotificationData): { subject: string; html: string; text: string } {
    const subject = `Great news! ${data.refereeName} joined MyRentCard through your referral`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">MyRentCard</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Referral Reward</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #2d3748; margin: 0 0 20px 0;">Congratulations ${data.referrerName}! 🎉</h2>
          <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
            <strong>${data.refereeName}</strong> has successfully joined MyRentCard through your referral link.
          </p>
          ${data.rewardAmount ? `
          <div style="background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%); padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <p style="color: #c53030; margin: 0; font-size: 18px; font-weight: 600;">
              You've earned ${data.rewardAmount}!
            </p>
          </div>
          ` : ''}
          <p style="color: #4a5568; line-height: 1.6; margin: 0 0 30px 0;">
            Keep sharing MyRentCard with friends and family to earn more rewards:
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.referralLink}" style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(237, 137, 54, 0.3);">
              Share Your Referral Link
            </a>
          </div>
        </div>
        <div style="background-color: #f7fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #a0aec0; font-size: 12px; margin: 0;">
            Thank you for helping grow the MyRentCard community!
          </p>
        </div>
      </div>
    `;
    
    const text = `Congratulations ${data.referrerName}!

${data.refereeName} has successfully joined MyRentCard through your referral link.

${data.rewardAmount ? `You've earned ${data.rewardAmount}!` : ''}

Keep sharing MyRentCard: ${data.referralLink}

- The MyRentCard Team`;

    return { subject, html, text };
  }

  // Welcome new user template
  private getWelcomeNewUserTemplate(data: WelcomeNewUserData): { subject: string; html: string; text: string } {
    const subject = `Welcome to MyRentCard, ${data.userName}!`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">Welcome to MyRentCard!</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Your rental journey starts here</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #2d3748; margin: 0 0 20px 0;">Hello ${data.userName},</h2>
          <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
            Welcome to MyRentCard! We're excited to have you join our community and simplify your ${data.userType === 'tenant' ? 'apartment hunting' : 'property management'} experience.
          </p>
          ${data.referrerName && data.rewardAmount ? `
          <div style="background-color: #edf2f7; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="color: #4a5568; margin: 0 0 10px 0;">
              Thanks to <strong>${data.referrerName}</strong> for referring you! You've both earned <strong>${data.rewardAmount}</strong>.
            </p>
          </div>
          ` : ''}
          <p style="color: #4a5568; line-height: 1.6; margin: 0 0 30px 0;">
            Get started by setting up your ${data.userType === 'tenant' ? 'RentCard profile' : 'property listings'}:
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.dashboardUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="background-color: #f7fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #a0aec0; font-size: 12px; margin: 0;">
            Need help? Contact our support team anytime.
          </p>
        </div>
      </div>
    `;
    
    const text = `Welcome to MyRentCard, ${data.userName}!

We're excited to have you join our community and simplify your ${data.userType === 'tenant' ? 'apartment hunting' : 'property management'} experience.

${data.referrerName && data.rewardAmount ? `Thanks to ${data.referrerName} for referring you! You've both earned ${data.rewardAmount}.` : ''}

Get started: ${data.dashboardUrl}

- The MyRentCard Team`;

    return { subject, html, text };
  }

  // Follow-up reminder template
  private getFollowUpReminderTemplate(data: FollowUpReminderData): { subject: string; html: string; text: string } {
    const subject = `Reminder: ${data.actionRequired}${data.daysRemaining ? ` - ${data.daysRemaining} days remaining` : ''}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">MyRentCard</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Friendly Reminder</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #2d3748; margin: 0 0 20px 0;">Hello ${data.recipientName},</h2>
          <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
            This is a friendly reminder that you have the following action pending:
          </p>
          <div style="background-color: #fef5e7; border-left: 4px solid #f6ad55; padding: 20px; margin: 30px 0;">
            <p style="color: #744210; margin: 0; font-weight: 600;">${data.actionRequired}</p>
            ${data.daysRemaining ? `<p style="color: #9c4221; margin: 10px 0 0 0; font-size: 14px;">${data.daysRemaining} days remaining</p>` : ''}
          </div>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${data.actionUrl}" style="background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(246, 173, 85, 0.3);">
              Complete Action
            </a>
          </div>
        </div>
        <div style="background-color: #f7fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #a0aec0; font-size: 12px; margin: 0;">
            You can unsubscribe from reminder emails in your account settings.
          </p>
        </div>
      </div>
    `;
    
    const text = `Hello ${data.recipientName},

This is a friendly reminder that you have the following action pending:

${data.actionRequired}
${data.daysRemaining ? `${data.daysRemaining} days remaining` : ''}

Complete action: ${data.actionUrl}

- The MyRentCard Team`;

    return { subject, html, text };
  }

  // Utility method for backwards compatibility with existing code
  async sendReferenceVerificationEmail(
    reference: TenantReference,
    tenantName: string,
    baseUrl: string
  ): Promise<{ success: boolean; info?: any; error?: any }> {
    // Generate verification token (using existing logic)
    const token = this.generateVerificationToken(reference.id);
    const verificationUrl = `${baseUrl}/references/verify/${token}`;
    
    return await this.sendEmail(
      EmailType.REFERENCE_VERIFICATION,
      reference.email,
      {
        referenceName: reference.name,
        tenantName,
        verificationUrl
      }
    );
  }

  // Token generation (existing logic from email.ts)
  private generateVerificationToken(referenceId: number): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const secretKey = process.env.TOKEN_SECRET || 'default-secret-key-change-in-production';
    
    const data = `${referenceId}:${timestamp}:${randomString}:${secretKey}`;
    const hash = require('crypto').createHash('sha256').update(data).digest('hex');
    
    return Buffer.from(`${referenceId}:${timestamp}:${hash}`).toString('base64');
  }

  // Get service status
  getStatus(): { provider: string; initialized: boolean; config: Partial<EmailConfig> } {
    return {
      provider: this.config.provider,
      initialized: this.isInitialized,
      config: {
        provider: this.config.provider,
        fromEmail: this.config.fromEmail,
        fromName: this.config.fromName
      }
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types for use in other files
export type {
  EmailConfig,
  ReferenceVerificationData,
  RentCardRequestData,
  ReferralNotificationData,
  WelcomeNewUserData,
  FollowUpReminderData,
  EmailTemplateData
};

// Export backwards compatibility function for existing code
export async function initializeEmailService(): Promise<void> {
  return await emailService.initialize();
}

export async function sendReferenceVerificationEmail(
  reference: TenantReference,
  tenantName: string,
  baseUrl: string
): Promise<{ success: boolean; info?: any; error?: any }> {
  return await emailService.sendReferenceVerificationEmail(reference, tenantName, baseUrl);
}

// Token verification (existing logic from email.ts) 
export function verifyToken(token: string): { referenceId: number, timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('ascii');
    const [referenceIdStr, timestampStr, hash] = decoded.split(':');
    
    const referenceId = parseInt(referenceIdStr, 10);
    const timestamp = parseInt(timestampStr, 10);
    
    if (isNaN(referenceId) || isNaN(timestamp)) {
      console.error('Invalid token format: could not parse referenceId or timestamp');
      return null;
    }
    
    const now = Date.now();
    const tokenAge = now - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (tokenAge > maxAge) {
      console.error('Token expired: token age is', tokenAge, 'ms, max age is', maxAge, 'ms');
      return null;
    }
    
    return { referenceId, timestamp };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}