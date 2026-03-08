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
