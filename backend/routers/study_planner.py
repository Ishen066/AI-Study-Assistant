from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models.study_plan import StudyPlan
from schemas.study_plan import (
    StudyPlanCreate,
    StudyPlanResponse,
    StudyPlanUpdate,
)
from routers.auth import get_current_user


router = APIRouter(
    prefix="/api/study-planner",
    tags=["Study Planner"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# Create a study task
@router.post("/", response_model=StudyPlanResponse)
def create_study_plan(
    plan: StudyPlanCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_plan = StudyPlan(
        user_id=current_user.id,
        topic=plan.topic,
        material_id=plan.material_id,
        study_date=plan.study_date,
        start_time=plan.start_time,
        duration_minutes=plan.duration_minutes,
        priority=plan.priority,
        notes=plan.notes,
        completed=False
    )

    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    return new_plan


# Get all study tasks
@router.get("/", response_model=list[StudyPlanResponse])
def get_study_plans(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    plans = (
        db.query(StudyPlan)
        .filter(StudyPlan.user_id == current_user.id)
        .order_by(
            StudyPlan.study_date.asc(),
            StudyPlan.start_time.asc()
        )
        .all()
    )

    return plans


# Update a study task
@router.put("/{plan_id}", response_model=StudyPlanResponse)
def update_study_plan(
    plan_id: int,
    plan: StudyPlanUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing_plan = (
        db.query(StudyPlan)
        .filter(
            StudyPlan.id == plan_id,
            StudyPlan.user_id == current_user.id
        )
        .first()
    )

    if not existing_plan:
        raise HTTPException(
            status_code=404,
            detail="Study plan not found"
        )

    update_data = plan.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(existing_plan, field, value)

    db.commit()
    db.refresh(existing_plan)

    return existing_plan


# Delete a study task
@router.delete("/{plan_id}")
def delete_study_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing_plan = (
        db.query(StudyPlan)
        .filter(
            StudyPlan.id == plan_id,
            StudyPlan.user_id == current_user.id
        )
        .first()
    )

    if not existing_plan:
        raise HTTPException(
            status_code=404,
            detail="Study plan not found"
        )

    db.delete(existing_plan)
    db.commit()

    return {
        "message": "Study plan deleted successfully"
    }