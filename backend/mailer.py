import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

GMAIL_ADDRESS      = os.getenv("GMAIL_ADDRESS")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")


def send_otp_email(to_email: str, username: str, otp: str):
    """
    Sends the fractal OTP to the user's registered email via Gmail SMTP.
    Raises an exception if sending fails so the endpoint can handle it.
    """
    if not GMAIL_ADDRESS or not GMAIL_APP_PASSWORD:
        raise RuntimeError("Gmail credentials not set in .env file")

    subject = "Your Fractal Auth OTP"

    # ── HTML email body ───────────────────────────────────────────────────
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body {{
          margin: 0; padding: 0;
          background: #020c18;
          font-family: 'Courier New', monospace;
          color: #dce8ff;
        }}
        .wrapper {{
          max-width: 480px;
          margin: 40px auto;
          background: rgba(10, 20, 35, 0.95);
          border: 1px solid rgba(99,230,226,0.25);
          border-radius: 20px;
          overflow: hidden;
        }}
        .header {{
          padding: 32px 40px 20px;
          border-bottom: 1px solid rgba(99,230,226,0.1);
          text-align: center;
        }}
        .header h1 {{
          font-size: 13px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(99,230,226,0.5);
          margin: 0 0 8px;
        }}
        .header h2 {{
          font-size: 22px;
          font-weight: 700;
          color: rgba(220,240,255,0.95);
          margin: 0;
          letter-spacing: -0.01em;
        }}
        .body {{
          padding: 32px 40px;
        }}
        .greeting {{
          font-size: 13px;
          color: rgba(220,240,255,0.6);
          margin-bottom: 24px;
        }}
        .otp-label {{
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(99,230,226,0.45);
          margin-bottom: 12px;
        }}
        .otp-box {{
          background: rgba(99,230,226,0.06);
          border: 1px solid rgba(99,230,226,0.3);
          border-radius: 14px;
          text-align: center;
          padding: 24px;
          margin-bottom: 24px;
        }}
        .otp-code {{
          font-size: 42px;
          font-weight: 700;
          letter-spacing: 0.35em;
          color: rgba(99,230,226,1);
          text-shadow: 0 0 20px rgba(99,230,226,0.4);
        }}
        .warning {{
          font-size: 11px;
          color: rgba(255,200,80,0.7);
          background: rgba(255,200,80,0.06);
          border: 1px solid rgba(255,200,80,0.15);
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 20px;
        }}
        .footer {{
          padding: 16px 40px 28px;
          text-align: center;
          font-size: 10px;
          letter-spacing: 0.1em;
          color: rgba(99,230,226,0.2);
          border-top: 1px solid rgba(99,230,226,0.07);
        }}
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>Fractal Auth System</h1>
          <h2>One-Time Passcode</h2>
        </div>
        <div class="body">
          <p class="greeting">Hello <strong>{username}</strong>, your authentication OTP is ready.</p>
          <p class="otp-label">Your OTP</p>
          <div class="otp-box">
            <div class="otp-code">{otp}</div>
          </div>
          <div class="warning">
            ⚠ This OTP is valid for 30 seconds. Do not share it with anyone.
          </div>
        </div>
        <div class="footer">
          ◈ Chaos-based OTP · Behavior Vector Auth · SHA-256
        </div>
      </div>
    </body>
    </html>
    """

    # ── Build the message ─────────────────────────────────────────────────
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = GMAIL_ADDRESS
    msg["To"]      = to_email
    msg.attach(MIMEText(html, "html"))

    # ── Send via Gmail SMTP ───────────────────────────────────────────────
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_ADDRESS, to_email, msg.as_string())