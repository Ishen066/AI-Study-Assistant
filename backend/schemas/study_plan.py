from datetime import date, time
from typing import Optional

from pydantic import BaseModel, Field


class StudyPlanCreate(BaseModel):
    topic: str = Field(min_length=1, max_length=255)

    material_id: Optional[int] = None

    study_date: date

    start_time: Optional[time] = None

    duration_minutes: int = Field(gt=0, le=1440)

    priority: str = Field(default="Medium")

    notes: Optional[str] = None


class StudyPlanResponse(BaseModel):
    id: int
    user_id: int
    topic: str
    material_id: Optional[int]
    study_date: date
    start_time: Optional[time]
    duration_minutes: int
    priority: str
    notes: Optional[str]
    completed: bool

    class Config:
        from_attributes = True


class StudyPlanUpdate(BaseModel):
    topic: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255
    )

    material_id: Optional[int] = None

    study_date: Optional[date] = None

    start_time: Optional[time] = None

    duration_minutes: Optional[int] = Field(
        default=None,
        gt=0,
        le=1440
    )

    priority: Optional[str] = None

    notes: Optional[str] = None

    completed: Optional[bool] = None