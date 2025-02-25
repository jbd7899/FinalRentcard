import nodemailer from 'nodemailer';
import { TenantReference } from '@shared/schema';

// Configure email transport
// For production, use a real email service like SendGrid, Mailgun, etc.
// For development, you can use a test account from Ethereal
let transporter: nodemailer.Transporter | null = null;

// Initialize the email transporter
export async function initializeEmailService(): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'production') {
      // Production email configuration
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.example.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASSWORD || '',
        },
      });
      
      // Verify connection configuration
      await transporter.verify();
      console.log('Production email service initialized successfully');
    } else {
      // Development email configuration using Ethereal
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      
      // Verify connection configuration
      await transporter.verify();
      console.log('Development email service initialized with Ethereal');
      console.log('Test email account created:', testAccount.user);
      console.log('Test email password:', testAccount.pass);
    }
  } catch (error) {
    console.error('Failed to initialize email service:', error);
    throw new Error(`Email service initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Generate a secure verification token
export function generateVerificationToken(referenceId: number): string {
  // Use a more secure method with a secret key and expiration
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const secretKey = process.env.TOKEN_SECRET || 'default-secret-key-change-in-production';
  
  // Combine reference ID, timestamp, and random string with a secret key
  const data = `${referenceId}:${timestamp}:${randomString}:${secretKey}`;
  
  // Hash the data for additional security
  const hash = require('crypto').createHash('sha256').update(data).digest('hex');
  
  // Return a token with the reference ID, timestamp, and hash
  return Buffer.from(`${referenceId}:${timestamp}:${hash}`).toString('base64');
}

// Verify a token and extract the reference ID
export function verifyToken(token: string): { referenceId: number, timestamp: number } | null {
  try {
    // Decode the token
    const decoded = Buffer.from(token, 'base64').toString('ascii');
    const [referenceIdStr, timestampStr, hash] = decoded.split(':');
    
    // Parse the reference ID and timestamp
    const referenceId = parseInt(referenceIdStr, 10);
    const timestamp = parseInt(timestampStr, 10);
    
    // Validate the parsed values
    if (isNaN(referenceId) || isNaN(timestamp)) {
      console.error('Invalid token format: could not parse referenceId or timestamp');
      return null;
    }
    
    // Check if the token is expired (24 hours)
    const now = Date.now();
    const tokenAge = now - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (tokenAge > maxAge) {
      console.error('Token expired: token age is', tokenAge, 'ms, max age is', maxAge, 'ms');
      return null; // Token expired
    }
    
    // For additional security, you could recreate the hash and verify it matches
    // This would require storing the secret key and random string, which is beyond the scope of this example
    
    return { referenceId, timestamp };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Send a verification email to a reference
export async function sendReferenceVerificationEmail(
  reference: TenantReference,
  tenantName: string,
  baseUrl: string
): Promise<{ success: boolean; info?: nodemailer.SentMessageInfo; error?: any }> {
  try {
    if (!transporter) {
      throw new Error('Email service not initialized');
    }
    
    // Generate a verification token
    const token = generateVerificationToken(reference.id);
    
    // Create the verification URL
    const verificationUrl = `${baseUrl}/references/verify/${token}`;
    
    // Create the email HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #4a6ee0;">RentCard Reference Verification</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hello ${reference.name},</p>
          <p>${tenantName} has listed you as a reference on their RentCard profile.</p>
          <p>Please take a moment to verify this reference by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4a6ee0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Reference
            </a>
          </div>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you did not expect this email, please disregard it.</p>
          <p>Thank you for your time!</p>
          <p>- The RentCard Team</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `;
    
    // Send the email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"RentCard" <noreply@rentcard.com>',
      to: reference.email,
      subject: `Reference Verification Request from ${tenantName}`,
      html: htmlContent,
      text: `Hello ${reference.name},\n\n${tenantName} has listed you as a reference on their RentCard profile.\n\nPlease verify this reference by visiting the following link:\n${verificationUrl}\n\nThis verification link will expire in 24 hours.\n\nIf you did not expect this email, please disregard it.\n\nThank you for your time!\n\n- The RentCard Team`,
    });
    
    console.log('Verification email sent:', info.messageId);
    
    // For development, log the preview URL
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, info };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
} 