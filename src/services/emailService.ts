import nodemailer from 'nodemailer';

interface SendResetEmailParams {
  to: string;
  resetToken: string;
  resetLink: string;
}

export interface SendEmailResult {
  success: boolean;
  previewUrl?: string;
  messageId?: string;
}

export class EmailService {
  private static getTransporter() {
    const host = process.env.EMAIL_HOST || 'mail.privateemail.com';
    const port = parseInt(process.env.MAIL_PORT || '587', 10);
    const secure = process.env.MAIL_SECURE === 'true';

    const user = (process.env.MAIL_USER || '')
      .replace(/^"|"$/g, '')
      .trim();

    const pass = (process.env.MAIL_PASS || '')
      .replace(/^"|"$/g, '');

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });
  }

  static async sendPasswordResetEmail({ to, resetToken, resetLink }: SendResetEmailParams): Promise<SendEmailResult> {
    const user = (process.env.MAIL_USER || 'noreply@oysterelectronics.com').replace(/^"|"$/g, '').trim();

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - Oyster</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          color: #334155;
        }
        .container {
          max-width: 580px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }
        .header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 32px 24px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .header span {
          color: #38bdf8;
        }
        .content {
          padding: 36px 32px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin-top: 0;
          margin-bottom: 16px;
        }
        .text {
          font-size: 15px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 24px;
        }
        .btn-wrapper {
          text-align: center;
          margin: 32px 0;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: #ffffff !important;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          padding: 14px 32px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
          transition: all 0.2s ease;
        }
        .code-box {
          background: #f1f5f9;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          margin: 24px 0;
        }
        .code-title {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .code-val {
          font-family: monospace;
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: 2px;
        }
        .link-fallback {
          word-break: break-all;
          font-size: 13px;
          color: #64748b;
          background: #f8fafc;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }
        .footer {
          background: #f8fafc;
          padding: 20px 32px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          font-size: 13px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🦪 Oyster <span>Security</span></h1>
        </div>
        <div class="content">
          <p class="greeting">Hello,</p>
          <p class="text">
            We received a request to reset your password for your Oyster account. Click the button below to verify your request and set up a new password:
          </p>
          
          <div class="btn-wrapper">
            <a href="${resetLink}" target="_blank" class="btn">Reset Password Now</a>
          </div>

          <div class="code-box">
            <div class="code-title">Direct Reset Token</div>
            <div class="code-val">${resetToken}</div>
          </div>

          <p class="text" style="font-size: 13px; color: #64748b;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <div class="link-fallback">
            <a href="${resetLink}" style="color: #0284c7;">${resetLink}</a>
          </div>

          <p class="text" style="margin-top: 24px; font-size: 13px; color: #94a3b8;">
            ⏰ This link and verification code will expire in <strong>60 minutes</strong>.<br>
            If you did not request a password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Oyster Electronics. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;

    // 1. Try sending via configured SMTP server
    if (user && process.env.MAIL_PASS) {
      try {
        const transporter = this.getTransporter();
        const info = await transporter.sendMail({
          from: `"Oyster Security" <${user}>`,
          to,
          subject: '🔐 Reset Your Oyster Password',
          text: `You requested a password reset for your Oyster account. Use this link to reset your password: ${resetLink} (Token: ${resetToken})`,
          html: htmlContent,
        });

        console.log(`[EmailService] Password reset email successfully sent to ${to} (Message ID: ${info.messageId})`);
        const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
        return { success: true, previewUrl, messageId: info.messageId };
      } catch (err: any) {
        console.error(`[EmailService Primary Transport Failed]: ${err.message || err}`);
        console.log(`[EmailService] Falling back to Ethereal Mail preview for development...`);
      }
    }

    // 2. Fallback to Ethereal SMTP for dev/test when primary SMTP is invalid or unconfigured
    try {
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await testTransporter.sendMail({
        from: `"Oyster Security" <noreply@oysterelectronics.com>`,
        to,
        subject: '🔐 Reset Your Oyster Password',
        text: `You requested a password reset for your Oyster account. Use this link to reset your password: ${resetLink} (Token: ${resetToken})`,
        html: htmlContent,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      console.log(`[EmailService Ethereal Test Mail Sent] Message ID: ${info.messageId}`);
      if (previewUrl) {
        console.log(`[EmailService Preview URL]: ${previewUrl}`);
      }
      return { success: true, previewUrl, messageId: info.messageId };
    } catch (fallbackErr: any) {
      console.error(`[EmailService Fallback Error]:`, fallbackErr.message || fallbackErr);
      console.log(`[EmailService Dev Link]: ${resetLink}`);
      return { success: false };
    }
  }
}

