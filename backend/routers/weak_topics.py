from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models.weak_topic import WeakTopic
from routers.auth import get_current_user


router = APIRouter(
    prefix="/api/weak-topics",
    tags=["Weak Topics"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_weak_topics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    weak_topics = (
        db.query(WeakTopic)
        .filter(WeakTopic.user_id == current_user.id)
        .order_by(WeakTopic.wrong_count.desc())
        .all()
    )

    return [
        {
            "id": topic.id,
            "material_id": topic.material_id,
            "topic": topic.topic,
            "description": topic.description,
            "recommendation": topic.recommendation,
            "wrong_count": topic.wrong_count
        }
        for topic in weak_topics
    ]