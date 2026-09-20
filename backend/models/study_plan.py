from sqlalchemy import Column, Integer, String, Text, Date, Time, Boolean
from database import Base


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=False, index=True)

    topic = Column(String(255), nullable=False)

    material_id = Column(Integer, nullable=True)

    study_date = Column(Date, nullable=False)

    start_time = Column(Time, nullable=True)

    duration_minutes = Column(Integer, nullable=False)

    priority = Column(String(20), default="Medium")

    notes = Column(Text, nullable=True)

    completed = Column(Boolean, default=False)