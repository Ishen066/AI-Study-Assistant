from sqlalchemy import Column, Integer, ForeignKey
from database import Base


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)

    material_id = Column(
        Integer,
        ForeignKey("study_materials.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    score = Column(Integer, nullable=False)

    total_questions = Column(Integer, nullable=False)

    correct_answers = Column(Integer, nullable=False)

    wrong_answers = Column(Integer, nullable=False)