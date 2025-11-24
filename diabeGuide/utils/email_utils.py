import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

# Email configuration from environment variables
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USERNAME = os.getenv('SMTP_USERNAME', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
FROM_EMAIL = os.getenv('FROM_EMAIL', SMTP_USERNAME)

def generate_otp(length=6):
    """Generate a random OTP"""
    return ''.join(random.choices(string.digits, k=length))

def send_otp_email(to_email, otp):
    """Send OTP to user's email"""
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = 'DiabeGuide - Email Verification OTP'
        
        # Email body
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0fdf4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #10b981; text-align: center;">DiabeGuide Email Verification</h2>
                    <p style="font-size: 16px; color: #333;">Hello,</p>
                    <p style="font-size: 16px; color: #333;">Thank you for signing up for DiabeGuide! Please use the following OTP to verify your email address:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="display: inline-block; background-color: #10b981; color: white; padding: 15px 30px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                            {otp}
                        </div>
                    </div>
                    <p style="font-size: 14px; color: #666;">This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
                    <p style="font-size: 14px; color: #666; margin-top: 20px;">Best regards,<br>The DiabeGuide Team</p>
                </div>
            </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Send email
        if SMTP_USERNAME and SMTP_PASSWORD:
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            return True
        else:
            # If no email credentials, print OTP to console (for development)
            print(f"\n{'='*50}")
            print(f"OTP for {to_email}: {otp}")
            print(f"{'='*50}\n")
            return True
    except Exception as e:
        print(f"Error sending email: {e}")
        # For development, still print OTP
        print(f"\n{'='*50}")
        print(f"OTP for {to_email}: {otp}")
        print(f"{'='*50}\n")
        return False


