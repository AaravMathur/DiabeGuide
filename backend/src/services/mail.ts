import nodemailer from "nodemailer";

export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  const smtpServer = process.env.SMTP_SERVER;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USERNAME;
  const smtpPass = process.env.SMTP_PASSWORD;

  // Fallback to console logs if SMTP details are missing in the configuration
  if (!smtpServer || !smtpUser || !smtpPass) {
    console.log(`[Offline Mail Fallback] SMTP details not fully set in .env.`);
    console.log(`[OTP Code Alert] Verification OTP for ${email} is: ${otp}`);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpServer,
      port: smtpPort,
      secure: smtpPort === 465, // True for port 465, false for 587 or other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: `"DiabeGuide Health Team" <${smtpUser}>`,
      to: email,
      subject: "DiabeGuide Verification Code",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; width: 50px; height: 50px; border-radius: 50px; background: linear-gradient(135deg, #2563eb, #06b6d4); line-height: 50px; color: #ffffff; font-size: 24px; font-weight: bold;">
              D
            </div>
            <h2 style="margin-top: 15px; color: #0f172a; font-size: 22px; font-weight: 700; letter-spacing: -0.025em;">Confirm Your Registration</h2>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
            Thank you for signing up for **DiabeGuide**! Use the verification code below to verify your email address. This code is valid for **10 minutes**.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #2563eb; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px solid #cbd5e1; display: inline-block;">
              ${otp}
            </span>
          </div>
          
          <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin-bottom: 25px; text-align: center;">
            If you did not initiate this request, you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
          
          <div style="text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.4;">
            <p style="margin: 0; font-weight: 600; color: #64748b;">DiabeGuide Health Advisor</p>
            <p style="margin: 3px 0 0 0;">AI-powered diabetes logging and tracking assistance</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Dispatch] OTP email sent successfully to ${email} (MessageID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error("[Email Dispatch Error] Failed to send email via SMTP:", error);
    console.log(`[Offline Mail Fallback] SMTP send failed. Using dev fallback OTP.`);
    console.log(`[OTP Code Alert] Verification OTP for ${email} is: ${otp}`);
    return true;
  }
};

export const sendResetOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  const smtpServer = process.env.SMTP_SERVER;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USERNAME;
  const smtpPass = process.env.SMTP_PASSWORD;

  if (!smtpServer || !smtpUser || !smtpPass) {
    console.log(`[Offline Mail Fallback] SMTP details not fully set in .env.`);
    console.log(`[OTP Code Alert] Password Reset OTP for ${email} is: ${otp}`);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpServer,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: `"DiabeGuide Support" <${smtpUser}>`,
      to: email,
      subject: "DiabeGuide Password Reset Verification Code",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; width: 50px; height: 50px; border-radius: 50px; background: linear-gradient(135deg, #ef4444, #f97316); line-height: 50px; color: #ffffff; font-size: 24px; font-weight: bold;">
              D
            </div>
            <h2 style="margin-top: 15px; color: #0f172a; font-size: 22px; font-weight: 700; letter-spacing: -0.025em;">Reset Your Password</h2>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
            You are receiving this email because you requested a password reset for your **DiabeGuide** account. Use the code below to reset your password. This code is valid for **10 minutes**.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #ef4444; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px solid #cbd5e1; display: inline-block;">
              ${otp}
            </span>
          </div>
          
          <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin-bottom: 25px; text-align: center;">
            If you did not request a password reset, you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
          
          <div style="text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.4;">
            <p style="margin: 0; font-weight: 600; color: #64748b;">DiabeGuide Support Team</p>
            <p style="margin: 3px 0 0 0;">AI-powered diabetes logging and tracking assistance</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Dispatch] Password reset OTP email sent successfully to ${email} (MessageID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error("[Email Dispatch Error] Failed to send password reset email via SMTP:", error);
    console.log(`[Offline Mail Fallback] SMTP send failed. Using dev fallback OTP.`);
    console.log(`[OTP Code Alert] Password Reset OTP for ${email} is: ${otp}`);
    return true;
  }
};
