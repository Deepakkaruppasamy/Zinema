# Email Setup Guide for Zinema

## Current Issues

1. **Brevo API Key Issue**: The `BREVO_API_KEY` is currently set to the same value as `SMTP_PASS`, but they should be different
2. **SMTP Authentication Issue**: The SMTP credentials are not working properly

## How to Fix Email Sending

### Option 1: Fix Brevo API (Recommended)

1. **Get the correct Brevo API key**:
   - Go to [Brevo Dashboard](https://app.brevo.com/)
   - Navigate to Settings → API Keys
   - Create a new API key or copy the existing one
   - **Important**: This should be different from your SMTP password

2. **Update your `.env` file**:
   ```env
   BREVO_API_KEY=your_actual_brevo_api_key_here
   SENDER_EMAIL=your-email@domain.com
   SENDER_NAME=Zinema
   ```

### Option 2: Fix SMTP Configuration

1. **Verify SMTP credentials**:
   - Go to [Brevo SMTP Settings](https://app.brevo.com/settings/keys/api)
   - Check your SMTP username and password
   - Make sure they are correct

2. **Update your `.env` file**:
   ```env
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   SENDER_EMAIL=your-email@domain.com
   SENDER_NAME=Zinema
   ```

### Option 3: Use Gmail SMTP (Alternative)

If Brevo is not working, you can use Gmail SMTP:

1. **Enable 2-factor authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"

3. **Update your `.env` file**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-app-password
   SENDER_EMAIL=your-gmail@gmail.com
   SENDER_NAME=Zinema
   ```

## Testing Email Configuration

After updating your `.env` file:

1. **Restart your server**:
   ```bash
   # Stop the server (Ctrl+C)
   # Start the server again
   npm start
   ```

2. **Test email sending**:
   ```bash
   cd server
   node test-email.js
   ```

3. **Check the output**:
   - ✅ All variables should be SET
   - ✅ Email should be sent successfully
   - ❌ If errors occur, check the error messages and fix accordingly

## Current Environment Status

Based on the verification script, your current setup has:
- ✅ BREVO_API_KEY: SET (but incorrect)
- ✅ SMTP_USER: SET
- ✅ SMTP_PASS: SET  
- ✅ SENDER_EMAIL: SET
- ⚠️ SENDER_NAME: NOT SET (optional)
- ✅ SUPPORT_EMAIL: SET

## Next Steps

1. **Fix the Brevo API key** (recommended)
2. **Add SENDER_NAME to your .env file**
3. **Test the email system**
4. **Restart your server**

## Troubleshooting

### Common Issues:

1. **"Key not found" error**: Brevo API key is incorrect
2. **"Authentication failed" error**: SMTP credentials are wrong
3. **"Connection timeout" error**: Network/firewall issues
4. **Environment variables not loading**: Restart your server

### Debug Steps:

1. Check your `.env` file formatting (no line breaks in values)
2. Verify credentials with the email provider
3. Test with a simple email first
4. Check server logs for detailed error messages
