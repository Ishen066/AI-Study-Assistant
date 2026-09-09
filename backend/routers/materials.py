import os
import shutil
from uuid import uuid4

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from pypdf import PdfReader

from database import SessionLocal
from models.study_material import StudyMaterial
from routers.auth import get_current_user


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