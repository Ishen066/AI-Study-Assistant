from sqlalchemy import Column, Integer, Text, ForeignKey
from database import Base


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)

    material_id = Column(
        Integer,
        ForeignKey("study_materials.id"),
        nullable=False
    )

    question = Column(Text, nullable=False)

    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)

    correct_answer = Column(Text, nullable=False)