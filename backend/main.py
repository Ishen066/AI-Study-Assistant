from fastapi import FastAPI

from database import Base, engine
from models.user import User
from routers.auth import router as auth_router
from models.study_material import StudyMaterial
from models.summary import Summary
from models.quiz import QuizQuestion
from routers.materials import router as materials_router

# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Study Assistant API",
    description="Backend API for the AI-powered study assistant",
    version="1.0.0"
)


# Authentication routes
app.include_router(auth_router)
app.include_router(materials_router)


@app.get("/")
def home():
    return {
        "message": "AI Study Assistant API is running!"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "message": "API is working correctly"
    }