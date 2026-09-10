import os
import shutil
from uuid import uuid4

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from pypdf import PdfReader

from database import SessionLocal
from models.summary import Summary
from models.study_material import StudyMaterial
from models.quiz import QuizQuestion
from routers.auth import get_current_user
from ai import generate_summary, generate_quiz


router = APIRouter(
    prefix="/api/materials",
    tags=["Study Materials"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ==========================================
# UPLOAD PDF
# ==========================================

@router.post("/upload")
def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    unique_filename = f"{uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        reader = PdfReader(file_path)

        extracted_text = ""

        for page in reader.pages:
            text = page.extract_text()

            if text:
                extracted_text += text + "\n"

    except Exception:
        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=400,
            detail="Could not read PDF file"
        )

    material = StudyMaterial(
        title=file.filename,
        filename=unique_filename,
        file_path=file_path,
        extracted_text=extracted_text,
        user_id=current_user.id
    )

    db.add(material)
    db.commit()
    db.refresh(material)

    return {
        "message": "PDF uploaded successfully",
        "material_id": material.id,
        "title": material.title,
        "filename": material.filename,
        "extracted_text_length": len(extracted_text)
    }


# ==========================================
# GET MY UPLOADED MATERIALS
# ==========================================

@router.get("/")
def get_my_materials(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    materials = (
        db.query(StudyMaterial)
        .filter(StudyMaterial.user_id == current_user.id)
        .order_by(StudyMaterial.id.desc())
        .all()
    )

    return [
        {
            "id": material.id,
            "title": material.title,
            "filename": material.filename,
            "extracted_text_length": len(material.extracted_text or "")
        }
        for material in materials
    ]


# ==========================================
# GENERATE AI SUMMARY
# ==========================================

@router.post("/{material_id}/summarize")
def summarize_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    material = (
        db.query(StudyMaterial)
        .filter(
            StudyMaterial.id == material_id,
            StudyMaterial.user_id == current_user.id
        )
        .first()
    )

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Study material not found"
        )

    if not material.extracted_text:
        raise HTTPException(
            status_code=400,
            detail="No text found in this PDF"
        )

    summary_text = generate_summary(
        material.extracted_text
    )

    summary = Summary(
        material_id=material.id,
        summary_text=summary_text
    )

    db.add(summary)
    db.commit()
    db.refresh(summary)

    return {
        "message": "AI summary generated successfully",
        "summary_id": summary.id,
        "material_id": material.id,
        "summary": summary.summary_text
    }


# ==========================================
# GENERATE AI QUIZ
# ==========================================

@router.post("/{material_id}/quiz")
def generate_material_quiz(
    material_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    material = (
        db.query(StudyMaterial)
        .filter(
            StudyMaterial.id == material_id,
            StudyMaterial.user_id == current_user.id
        )
        .first()
    )

    if not material:
        raise HTTPException(
            status_code=404,
            detail="Study material not found"
        )

    if not material.extracted_text:
        raise HTTPException(
            status_code=400,
            detail="No text found in this PDF"
        )

    try:
        quiz_data = generate_quiz(
            material.extracted_text,
            number_of_questions=5
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate quiz"
        )

    saved_questions = []

    for item in quiz_data["questions"]:
        question = QuizQuestion(
            material_id=material.id,
            question=item["question"],
            option_a=item["option_a"],
            option_b=item["option_b"],
            option_c=item["option_c"],
            option_d=item["option_d"],
            correct_answer=item["correct_answer"]
        )

        db.add(question)
        saved_questions.append(question)

    db.commit()

    for question in saved_questions:
        db.refresh(question)

    return {
        "message": "Quiz generated successfully",
        "material_id": material.id,
        "number_of_questions": len(saved_questions),
        "questions": [
            {
                "id": question.id,
                "question": question.question,
                "option_a": question.option_a,
                "option_b": question.option_b,
                "option_c": question.option_c,
                "option_d": question.option_d
            }
            for question in saved_questions
        ]
    }