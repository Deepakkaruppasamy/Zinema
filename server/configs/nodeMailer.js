import nodemailer from 'nodemailer';
import axios from 'axios';

const SMTP_HOST = process.env.SMTP_HOST || "smtp-relay.brevo.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465;

function createTransport(port = SMTP_PORT, secure = SMTP_SECURE) {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
  });
}

const FROM_EMAIL = process.env.SENDER_EMAIL || process.env.SMTP_USER;
const FROM_NAME = process.env.SENDER_NAME || 'Zinema';

function stripHtml(html = '') {
  try { return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); } catch { return html; }
}

const sendEmail = async ({ to, subject, body, html, text, attachments = [], replyTo, fromName }) => {
  if (!to) throw new Error('sendEmail: missing "to"')
  if (!subject) throw new Error('sendEmail: missing "subject"')
  const htmlBody = html ?? body ?? ''
  const textBody = text ?? stripHtml(htmlBody)

  const brevoApiKey = process.env.BREVO_API_KEY || process.env.BREVO_KEY;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  
  if (!brevoApiKey && (!smtpUser || !smtpPass)) {
    console.error('❌ Email configuration missing:');
    console.error('   - BREVO_API_KEY not set');
    console.error('   - SMTP_USER not set');
    console.error('   - SMTP_PASS not set');
    console.error('   Please configure email settings in your .env file');
    throw new Error('Email configuration incomplete. Please set BREVO_API_KEY or SMTP_USER/SMTP_PASS in your environment variables.');
  }

  if (brevoApiKey && smtpPass && brevoApiKey === smtpPass) {
    console.warn('⚠️  WARNING: BREVO_API_KEY is the same as SMTP_PASS');
    console.warn('   These should be different values. Please get the correct Brevo API key.');
    console.warn('   Falling back to SMTP authentication...');
  }

  if (brevoApiKey) {
    console.log('📧 Sending email via Brevo API...');
    const payload = {
      sender: FROM_EMAIL ? { email: FROM_EMAIL, name: fromName || FROM_NAME } : undefined,
      to: [{ email: Array.isArray(to) ? to[0] : to }],
      subject,
      htmlContent: htmlBody,
      textContent: textBody,
      replyTo: replyTo ? { email: replyTo } : undefined,
    };
    try {
      const res = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
        headers: {
          'api-key': brevoApiKey,
          'accept': 'application/json',
          'content-type': 'application/json',
        },
        timeout: 15000,
      });
      console.log('✅ Email sent successfully via Brevo API');
      return res.data;
    } catch (brevoErr) {
      console.error('❌ Brevo API Error:', brevoErr.response?.data || brevoErr.message);
      console.log('🔄 Falling back to SMTP...');
    }
  }

  const mailOptions = {
    from: FROM_EMAIL ? `${fromName || FROM_NAME} <${FROM_EMAIL}>` : undefined,
    to,
    subject,
    html: htmlBody,
    text: textBody,
    attachments,
    replyTo,
  }

  try {
    const primaryTransporter = createTransport();
    const response = await primaryTransporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully via SMTP');
    return response
  } catch (err) {
    console.error('❌ SMTP Error:', err.message);
    if (String(err?.code).toUpperCase() === 'ETIMEDOUT' || String(err?.command).toUpperCase() === 'CONN') {
      console.log('🔄 Retrying with alternate port 2525...');
      try {
        const altPort = Number(process.env.SMTP_ALT_PORT || 2525);
        const retryTransporter = createTransport(altPort, false);
        const response = await retryTransporter.sendMail(mailOptions)
        console.log('✅ Email sent successfully via SMTP (alternate port)');
        return response
      } catch (retryErr) {
        console.error('❌ SMTP Retry Error:', retryErr.message);
        throw retryErr;
      }
    }
    throw err
  }
}

export default sendEmail;