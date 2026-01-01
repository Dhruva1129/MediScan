from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Summary(Base):
    __tablename__ = "summaries"
    id = Column(Integer, primary_key=True, index=True)
    user_prompt = Column(Text, nullable=True)
    summary_response = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
