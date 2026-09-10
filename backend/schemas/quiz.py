from pydantic import BaseModel
from typing import List


class QuizAnswer(BaseModel):
    question_id: int
    answer: str


class QuizSubmit(BaseModel):
    answers: List[QuizAnswer]