from passlib.context import CryptContext
from app.core.database import SessionLocal
from app.models.user import User
from app.models.user_otp import UserOTP
from sqlalchemy.future import select
import secrets
import aiosmtplib
import os
from email.message import EmailMessage
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    # bcrypt only supports up to 72 bytes
    return pwd_context.hash(password[:72])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def create_user(username: str, email: str, password: str):
    async with SessionLocal() as session:
        hashed_password = get_password_hash(password)
        user = User(username=username, email=email, hashed_password=hashed_password)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

async def authenticate_user(username: str, password: str):
    async with SessionLocal() as session:
        result = await session.execute(select(User).where(User.username == username))
        user = result.scalars().first()
        if user and verify_password(password, user.hashed_password):
            return user
        return None

async def send_otp_email(email: str, otp: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not all([smtp_host, smtp_user, smtp_password]):
        print(f"DEBUG: Skipping email send (no credentials). OTP for {email} is {otp}")
        return

    msg = EmailMessage()
    msg.set_content(f"Your MediScan login OTP is: {otp}. It is valid for 5 minutes.")
    msg["Subject"] = "MediScan Login OTP"
    msg["From"] = smtp_user
    msg["To"] = email

    try:
        await aiosmtplib.send(
            msg,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            start_tls=True
        )
    except Exception as e:
        print(f"ERROR: Failed to send email via SMTP: {str(e)}")
        print(f"DEBUG: YOUR OTP IS: {otp}")
        # We don't bubble the error up so the application doesn't crash
        # This allows users to still log in by checking their terminal logs

async def create_otp(email: str):
    async with SessionLocal() as session:
        # Check if user exists
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        if not user:
            return None

        otp = "".join([str(secrets.randbelow(10)) for _ in range(4)])
        otp_record = UserOTP(email=email, otp=otp)
        session.add(otp_record)
        await session.commit()
        
        await send_otp_email(email, otp)
        return otp

async def verify_otp(email: str, otp: str):
    async with SessionLocal() as session:
        # Get the latest unused OTP for this email
        query = select(UserOTP).where(
            UserOTP.email == email,
            UserOTP.used == 0,
            UserOTP.created_at >= datetime.now() - timedelta(minutes=5)
        ).order_by(UserOTP.created_at.desc())
        
        result = await session.execute(query)
        otp_record = result.scalars().first()
        
        if otp_record and otp_record.otp == otp:
            # Mark as used
            otp_record.used = 1
            await session.commit()
            
            # Return the user
            user_result = await session.execute(select(User).where(User.email == email))
            return user_result.scalars().first()
        return None
