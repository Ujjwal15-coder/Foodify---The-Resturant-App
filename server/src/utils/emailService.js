/**
 * Email Service — Nodemailer configuration and email templates
 */
const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  // Return null if no SMTP configured — will log to console instead
  return null;
};

const transporter = createTransporter();

// Send email helper
const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    console.log('📧 [EMAIL - No SMTP configured, logging to console]');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${text || 'See HTML'}`);
    return { messageId: 'console-log-' + Date.now() };
  }

  const mailOptions = {
    from: `"FOODIFY" <${process.env.FROM_EMAIL || 'noreply@foodify.com'}>`,
    to,
    subject,
    html,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

// ---- Email Templates ----

const sendVerificationEmail = async (email, otp) => {
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #FF6B35, #FF8F5E); border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">🍔 FOODIFY</h1>
      </div>
      <div style="padding: 30px; background: #fff; border: 1px solid #eee;">
        <h2 style="color: #333;">Verify Your Email</h2>
        <p>Your verification code is:</p>
        <div style="text-align: center; padding: 20px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #FF6B35; background: #FFF5F0; padding: 15px 30px; border-radius: 8px;">${otp}</span>
        </div>
        <p style="color: #666;">This code expires in ${process.env.OTP_EXPIRE_MINUTES || 5} minutes.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'FOODIFY — Verify Your Email',
    html,
    text: `Your FOODIFY verification code is: ${otp}`,
  });
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #FF6B35, #FF8F5E); border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">🍔 FOODIFY</h1>
      </div>
      <div style="padding: 30px; background: #fff; border: 1px solid #eee;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>You requested a password reset. Click the button below:</p>
        <div style="text-align: center; padding: 20px;">
          <a href="${resetUrl}" style="background: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        <p style="color: #999; font-size: 12px;">Link expires in 10 minutes.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'FOODIFY — Password Reset',
    html,
    text: `Reset your password: ${resetUrl}`,
  });
};

const sendOrderConfirmationEmail = async (email, order) => {
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #FF6B35, #FF8F5E); border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">🍔 FOODIFY</h1>
      </div>
      <div style="padding: 30px; background: #fff; border: 1px solid #eee;">
        <h2 style="color: #333;">Order Confirmed! 🎉</h2>
        <p>Order Number: <strong>${order.orderNumber}</strong></p>
        <p>Total: <strong>₹${order.total}</strong></p>
        <p>Status: <strong>${order.status}</strong></p>
        <p style="color: #666;">Your food is being prepared. Track your order in the app!</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `FOODIFY — Order ${order.orderNumber} Confirmed`,
    html,
    text: `Order ${order.orderNumber} confirmed. Total: ₹${order.total}`,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
};
