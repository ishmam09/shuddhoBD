import nodemailer from "nodemailer";
import { ENV } from "../config/env";

// Create a transporter using Gmail service.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.smtpUser,
    pass: ENV.smtpPass,
  },
});

console.log(`[MAILER INFO] Initialized with Service: GMAIL, User: ${ENV.smtpUser}, Pass set: ${!!ENV.smtpPass}`);

export const sendOTPVerificationEmail = async (email: string, otp: string) => {
  if (!ENV.smtpUser || !ENV.smtpPass) {
    console.warn(`[DEV WARNING] SMTP credentials not fully configured. The OTP for ${email} is: ${otp}`);
  }

  try {
    const info = await transporter.sendMail({
      from: `"ShuddhoBD" <${ENV.smtpUser || "noreply@shuddhobd.com"}>`,
      to: email,
      subject: "Verify Your Email - ShuddhoBD Registration",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #059669;">ShuddhoBD</h2>
          <p>You have requested to create a citizen account on ShuddhoBD.</p>
          <p>Please use the following 6-digit verification code to complete your registration:</p>
          <div style="background-color: #f3f4f6; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1f2937;">${otp}</span>
          </div>
          <p>This code is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            ShuddhoBD securely handles all requests. Please do not reply to this automated email.
          </p>
        </div>
      `,
    });

    console.log("OTP email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

export const sendProfileUpdateOTPEmail = async (email: string, otp: string) => {
  if (!ENV.smtpUser || !ENV.smtpPass) {
    console.warn(`[DEV WARNING] SMTP credentials not fully configured. The Profile Update OTP for ${email} is: ${otp}`);
  }

  try {
    const info = await transporter.sendMail({
      from: `"ShuddhoBD Security" <${ENV.smtpUser || "noreply@shuddhobd.com"}>`,
      to: email,
      subject: "Confirm Your Profile Changes - ShuddhoBD",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">ShuddhoBD</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">Security Verification</h2>
            <p style="line-height: 1.6; color: #475569;">Hello,</p>
            <p style="line-height: 1.6; color: #475569;">A request was made to update your profile information on ShuddhoBD. To ensure your account remains secure, please use the 6-digit verification code below to confirm these changes.</p>
            
            <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; padding: 24px; text-align: center; border-radius: 12px; margin: 32px 0;">
              <span style="font-size: 42px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: monospace;">${otp}</span>
            </div>
            
            <p style="line-height: 1.6; color: #475569; font-size: 14px;">This code is valid for <strong>5 minutes</strong>. After this period, you will need to initiate a new request if you haven't completed the update.</p>
            
            <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; font-size: 13px; color: #9a3412;"><strong>Important:</strong> If you did not initiate this change, please ignore this email and consider updating your account password immediately.</p>
            </div>
          </div>
          <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 12px; color: #64748b; margin: 0;">&copy; 2024 ShuddhoBD. Secure, Transparent, Accountable.</p>
          </div>
        </div>
      `,
    });

    console.log("Profile update OTP email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending profile update OTP email:", error);
    return false;
  }
};
