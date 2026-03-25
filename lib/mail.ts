import nodemailer from "nodemailer";

interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail({ to, subject, text, html }: SendMailOptions) {
  // If SMTP variables are not set, just log the email content to the console
  // This is useful for development without an actual SMTP server
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    console.warn("⚠️ SMTP credentials are not fully configured. Email not sent, logging instead:");
    console.warn(`To: ${to}`);
    console.warn(`Subject: ${subject}`);
    console.warn(`Text format: ${text}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Aspirely" <${process.env.SMTP_FROM || "noreply@aspirely.com"}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  const subject = "Reset your Aspirely password";
  
  const text = `You requested a password reset. Click the link below to set a new password:\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Reset Your Password</h2>
      <p>You requested a password reset for your Aspirely account.</p>
      <p>Click the button below to set a new password:</p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetUrl}</p>
      <p style="margin-top: 40px; font-size: 12px; color: #9ca3af;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
}
