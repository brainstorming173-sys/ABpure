import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM || 'Abpure <onboarding@resend.dev>';
const base = process.env.CLIENT_URL || 'http://localhost:5173';

async function send(to, subject, html) {
  if (!resend) return console.log(`[email skipped: no RESEND_API_KEY] ${to} | ${subject}\n${html}`);
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) console.error('Resend error:', error);
}

export const sendVerifyEmail = (to, token) =>
  send(to, 'Verify your Abpure email',
    `<p>Welcome to Abpure.</p><p><a href="${base}/verify-email?token=${token}">Verify your email</a></p>`);

export const sendResetEmail = (to, token) =>
  send(to, 'Reset your Abpure password',
    `<p>Use this link within one hour:</p><p><a href="${base}/reset-password?token=${token}">Reset password</a></p>`);
