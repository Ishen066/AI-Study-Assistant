from sqlalchemy import Column, Integer, String, Text
from database import Base


class WeakTopic(Base):
    __tablename__ = "weak_topics"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=False, index=True)

    material_id = Column(Integer, nullable=False, index=True)

    topic = Column(String(255), nullable=False)

    description = Column(Text, nullable=True)

    recommendation = Column(Text, nullable=True)

    wrong_count = Column(Integer, default=0)