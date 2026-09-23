from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

from models.user import User
from models.study_material import StudyMaterial
from models.summary import Summary
from models.quiz import QuizQuestion
from models.quiz_result import QuizResult
from models.weak_topic import WeakTopic
from models.study_plan import StudyPlan

from routers.auth import router as auth_router
from routers.materials import router as materials_router
from routers.weak_topics import router as weak_topics_router
from routers.study_planner import router as study_planner_router
from routers.assistant import router as assistant_router


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="AI Study Assistant API",
    description="Backend API for the AI-powered study assistant",
    version="1.0.0"
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Authentication routes
app.include_router(auth_router)


# Study material routes
app.include_router(materials_router)


# Weak topics routes
app.include_router(weak_topics_router)


# Study planner routes
app.include_router(study_planner_router)


#ai assistant routes
app.include_router(assistant_router)


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