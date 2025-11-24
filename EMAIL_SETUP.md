# Email Configuration for OTP Verification

To enable email OTP verification, you need to configure email settings in your `.env` file.

## Setup Instructions

1. Create or edit the `.env` file in your project root
2. Add the following email configuration variables:

```env
# Email Configuration for OTP
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `SMTP_PASSWORD`

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo
```env
SMTP_SERVER=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Custom SMTP
```env
SMTP_SERVER=your-smtp-server.com
SMTP_PORT=587
SMTP_USERNAME=your-username
SMTP_PASSWORD=your-password
FROM_EMAIL=your-email@domain.com
```

## Development Mode

If email credentials are not configured, the system will:
- Print the OTP to the console/terminal
- Still allow OTP verification to work
- Display OTP in server logs

This is useful for development and testing.

## Testing

After configuration:
1. Start your Flask application
2. Try signing up with a new account
3. Check your email for the OTP (or check console if not configured)
4. Enter the OTP to complete registration

## Troubleshooting

- **OTP not received**: Check spam folder, verify email configuration
- **Connection error**: Verify SMTP server and port settings
- **Authentication failed**: Check username and password (use app password for Gmail)
- **For development**: Check console/terminal for OTP if email is not configured


