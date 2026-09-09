from sqlalchemy import Column, Integer, Text, ForeignKey
from database import Base


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)

    material_id = Column(
        Integer,
        ForeignKey("study_materials.id"),
        nullable=False
    )

    summary_text = Column(Text, nullable=False)