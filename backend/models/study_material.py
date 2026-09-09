from sqlalchemy import Column, Integer, String, ForeignKey, Text
from database import Base


class StudyMaterial(Base):
    __tablename__ = "study_materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    extracted_text = Column(Text, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)