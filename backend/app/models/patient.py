from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class PatientCondition(Base):
    __tablename__ = "patient_conditions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(50), nullable=False)
    state = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    suffering_problems = Column(Text, nullable=False)
    how_many_days = Column(String(50), nullable=False)
    
    analysis_response = Column(Text, nullable=False) # Store JSON string containing description and doctor type
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
