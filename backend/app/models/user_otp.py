from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class UserOTP(Base):
    __tablename__ = "user_otps"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), nullable=False, index=True)
    otp = Column(String(4), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    used = Column(Integer, default=0) # 0 for unused, 1 for used
