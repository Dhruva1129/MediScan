from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.core.database import Base



from sqlalchemy import ForeignKey


class Summary(Base):
    __tablename__ = "summaries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_prompt = Column(Text, nullable=True)
    summary_response = Column(Text, nullable=False)
    risk_response = Column(Text, nullable=True)
    next_step_response = Column(Text, nullable=True)
    ask_docter_response = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# Followup table for storing followup responses
class Followup(Base):
    __tablename__ = "followups"
    id = Column(Integer, primary_key=True, index=True)
    summary_id = Column(Integer, ForeignKey("summaries.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String(36), index=True, nullable=True)
    user_text = Column(Text, nullable=False)
    followup_response = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class GraphicsReport(Base):
    __tablename__ = "graphics_reports"
    id = Column(Integer, primary_key=True, index=True)
    summary_id = Column(Integer, ForeignKey("summaries.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_name = Column(String(255), nullable=False)
    patient_age = Column(Integer, nullable=False)
    patient_weight = Column(Integer, nullable=True)
    patient_gender = Column(String(20), nullable=False)
    chart_data = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
