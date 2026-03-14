from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class HospitalRecommendation(Base):
    __tablename__ = "hospital_recommendations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    location = Column(String(255), nullable=False)
    doctor_type = Column(String(255), nullable=False)
    recommendation_response = Column(Text, nullable=False) # Store JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SingleHospitalRecommendation(Base):
    __tablename__ = "single_hospital_recommendations"
    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(Integer, ForeignKey("hospital_recommendations.id"), nullable=False)
    llm_generated_id = Column(Integer, nullable=False)
    hospital_name = Column(String(255), nullable=False)
    doctor_name = Column(String(255), nullable=False)
    hospital_rating = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

