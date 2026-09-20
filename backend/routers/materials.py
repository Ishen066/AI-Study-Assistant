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
from models.quiz_result import QuizResult
from models.weak_topic import WeakTopic

from routers.auth import get_current_user

from ai import (
    generate_summary,
    generate_quiz,
    analyze_weak_topics
)

from schemas.quiz import QuizSubmit


router = APIRouter(
    prefix="/api/materials",
    tags=["Study Materials"]
)


# ==========================================
# DATABASE CONNECTION
# ==========================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ==========================================
# UPLOAD DIRECTORY
# ==========================================

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


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

    unique_filename = (
        f"{uuid4()}_{file.filename}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        unique_filename
    )

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    try:

        reader = PdfReader(
            file_path
        )

        extracted_text = ""

        for page in reader.pages:

            text = page.extract_text()

            if text:

                extracted_text += (
                    text + "\n"
                )

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
        "extracted_text_length": len(
            extracted_text
        )
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
        .filter(
            StudyMaterial.user_id
            == current_user.id
        )
        .order_by(
            StudyMaterial.id.desc()
        )
        .all()
    )

    return [
        {
            "id": material.id,
            "title": material.title,
            "filename": material.filename,
            "extracted_text_length": len(
                material.extracted_text or ""
            )
        }
        for material in materials
    ]


# ==========================================
# GET QUIZ PROGRESS
# IMPORTANT:
# Keep this BEFORE /{material_id}/...
# routes
# ==========================================

@router.get("/progress")
def get_progress(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    results = (
        db.query(QuizResult)
        .filter(
            QuizResult.user_id
            == current_user.id
        )
        .order_by(
            QuizResult.id.desc()
        )
        .all()
    )

    total_quizzes = len(results)

    if total_quizzes == 0:

        return {
            "total_quizzes": 0,
            "average_score": 0,
            "total_correct_answers": 0,
            "total_wrong_answers": 0,
            "quiz_results": []
        }

    total_score = sum(
        result.score
        for result in results
    )

    average_score = round(
        total_score / total_quizzes
    )

    total_correct = sum(
        result.correct_answers
        for result in results
    )

    total_wrong = sum(
        result.wrong_answers
        for result in results
    )

    return {
        "total_quizzes": total_quizzes,
        "average_score": average_score,
        "total_correct_answers": total_correct,
        "total_wrong_answers": total_wrong,

        "quiz_results": [

            {
                "result_id": result.id,
                "material_id": result.material_id,
                "score": result.score,
                "total_questions": result.total_questions,
                "correct_answers": result.correct_answers,
                "wrong_answers": result.wrong_answers
            }

            for result in results
        ]
    }


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
            StudyMaterial.user_id
            == current_user.id
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

        summary_text = generate_summary(
            material.extracted_text
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Failed to generate AI summary"
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
            StudyMaterial.user_id
            == current_user.id
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

    if not quiz_data.get("questions"):

        raise HTTPException(
            status_code=500,
            detail="AI did not generate any questions"
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

        saved_questions.append(
            question
        )

    db.commit()

    for question in saved_questions:

        db.refresh(question)

    return {
        "message": "Quiz generated successfully",
        "material_id": material.id,
        "number_of_questions": len(
            saved_questions
        ),

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


# ==========================================
# GET GENERATED QUIZ
# ==========================================

@router.get("/{material_id}/quiz")
def get_material_quiz(
    material_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    material = (
        db.query(StudyMaterial)
        .filter(
            StudyMaterial.id == material_id,
            StudyMaterial.user_id
            == current_user.id
        )
        .first()
    )

    if not material:

        raise HTTPException(
            status_code=404,
            detail="Study material not found"
        )

    questions = (
        db.query(QuizQuestion)
        .filter(
            QuizQuestion.material_id
            == material_id
        )
        .order_by(
            QuizQuestion.id.asc()
        )
        .all()
    )

    if not questions:

        raise HTTPException(
            status_code=404,
            detail="No quiz found for this material"
        )

    return {
        "material_id": material_id,
        "number_of_questions": len(
            questions
        ),

        "questions": [

            {
                "id": question.id,
                "question": question.question,
                "option_a": question.option_a,
                "option_b": question.option_b,
                "option_c": question.option_c,
                "option_d": question.option_d
            }

            for question in questions
        ]
    }


# ==========================================
# SUBMIT QUIZ AND CALCULATE SCORE
# ==========================================

@router.post("/{material_id}/quiz/submit")
def submit_quiz(
    material_id: int,
    quiz_submission: QuizSubmit,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # ==========================================
    # FIND MATERIAL
    # ==========================================

    material = (
        db.query(StudyMaterial)
        .filter(
            StudyMaterial.id == material_id,
            StudyMaterial.user_id
            == current_user.id
        )
        .first()
    )

    if not material:

        raise HTTPException(
            status_code=404,
            detail="Study material not found"
        )


    # ==========================================
    # GET QUIZ QUESTIONS
    # ==========================================

    questions = (
        db.query(QuizQuestion)
        .filter(
            QuizQuestion.material_id
            == material_id
        )
        .all()
    )

    if not questions:

        raise HTTPException(
            status_code=404,
            detail="No quiz found for this material"
        )


    question_map = {
        question.id: question
        for question in questions
    }


    # ==========================================
    # INITIALIZE SCORE DATA
    # ==========================================

    correct_answers = 0

    wrong_answers = 0

    results = []

    # Questions answered incorrectly
    wrong_questions = []


    # ==========================================
    # CHECK STUDENT ANSWERS
    # ==========================================

    for submitted_answer in (
        quiz_submission.answers
    ):

        question = question_map.get(
            submitted_answer.question_id
        )

        if not question:
            continue


        is_correct = (
            submitted_answer.answer
            .strip()
            .upper()
            ==
            question.correct_answer
            .strip()
            .upper()
        )


        if is_correct:

            correct_answers += 1

        else:

            wrong_answers += 1

            # Store wrong question text
            # for AI analysis
            wrong_questions.append(
                question.question
            )


        results.append({

            "question_id":
                question.id,

            "your_answer":
                submitted_answer.answer,

            "correct":
                is_correct

        })


    # ==========================================
    # CALCULATE SCORE
    # ==========================================

    total_questions = len(questions)

    score = round(
        (
            correct_answers
            /
            total_questions
        )
        * 100
    )


    # ==========================================
    # SAVE QUIZ RESULT
    # ==========================================

    quiz_result = QuizResult(

        material_id=material_id,

        user_id=current_user.id,

        score=score,

        total_questions=total_questions,

        correct_answers=correct_answers,

        wrong_answers=wrong_answers
    )

    db.add(quiz_result)

    db.commit()

    db.refresh(quiz_result)


    # ==========================================
    # AI WEAK TOPIC ANALYSIS
    # ==========================================

    weak_topics_created = []


    if wrong_questions:

        try:

            weak_topic_data = (
                analyze_weak_topics(
                    wrong_questions
                )
            )

            topics = weak_topic_data.get(
                "topics",
                []
            )


            # ==========================================
            # SAVE EACH WEAK TOPIC
            # ==========================================

            for topic_data in topics:

                topic_name = topic_data.get(
                    "topic",
                    ""
                ).strip()

                description = topic_data.get(
                    "description",
                    ""
                ).strip()

                recommendation = topic_data.get(
                    "recommendation",
                    ""
                ).strip()


                if not topic_name:
                    continue


                # Check existing weak topic
                existing_topic = (
                    db.query(WeakTopic)
                    .filter(
                        WeakTopic.user_id
                        == current_user.id,

                        WeakTopic.material_id
                        == material_id,

                        WeakTopic.topic
                        == topic_name
                    )
                    .first()
                )


                # ==========================================
                # UPDATE EXISTING TOPIC
                # ==========================================

                if existing_topic:

                    existing_topic.wrong_count += 1

                    if description:

                        existing_topic.description = (
                            description
                        )

                    if recommendation:

                        existing_topic.recommendation = (
                            recommendation
                        )

                    weak_topics_created.append(
                        existing_topic.id
                    )


                # ==========================================
                # CREATE NEW TOPIC
                # ==========================================

                else:

                    new_topic = WeakTopic(

                        user_id=current_user.id,

                        material_id=material_id,

                        topic=topic_name,

                        description=description,

                        recommendation=recommendation,

                        wrong_count=1
                    )

                    db.add(
                        new_topic
                    )

                    db.flush()

                    weak_topics_created.append(
                        new_topic.id
                    )


            db.commit()


        except Exception as error:

            # Quiz result should still be saved
            # even if AI analysis fails
            print(
                "Weak topic analysis failed:",
                error
            )


    # ==========================================
    # RETURN QUIZ RESULT
    # ==========================================

    return {

        "message":
            "Quiz submitted successfully",

        "result_id":
            quiz_result.id,

        "score":
            score,

        "total_questions":
            total_questions,

        "correct_answers":
            correct_answers,

        "wrong_answers":
            wrong_answers,

        "weak_topics_created":
            weak_topics_created,

        "results":
            results
    }


# ==========================================
# DELETE STUDY MATERIAL
# ==========================================

@router.delete("/{material_id}")
def delete_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    material = (
        db.query(StudyMaterial)
        .filter(
            StudyMaterial.id == material_id,
            StudyMaterial.user_id
            == current_user.id
        )
        .first()
    )

    if not material:

        raise HTTPException(
            status_code=404,
            detail="Study material not found"
        )


    # ==========================================
    # DELETE UPLOADED PDF
    # ==========================================

    if (
        material.file_path
        and
        os.path.exists(
            material.file_path
        )
    ):

        os.remove(
            material.file_path
        )


    # ==========================================
    # DELETE RELATED SUMMARIES
    # ==========================================

    db.query(Summary).filter(
        Summary.material_id
        == material_id
    ).delete(
        synchronize_session=False
    )


    # ==========================================
    # DELETE RELATED QUIZ QUESTIONS
    # ==========================================

    db.query(QuizQuestion).filter(
        QuizQuestion.material_id
        == material_id
    ).delete(
        synchronize_session=False
    )


    # ==========================================
    # DELETE RELATED QUIZ RESULTS
    # ==========================================

    db.query(QuizResult).filter(
        QuizResult.material_id
        == material_id
    ).delete(
        synchronize_session=False
    )


    # ==========================================
    # DELETE RELATED WEAK TOPICS
    # ==========================================

    db.query(WeakTopic).filter(
        WeakTopic.material_id
        == material_id
    ).delete(
        synchronize_session=False
    )


    # ==========================================
    # DELETE MATERIAL
    # ==========================================

    db.delete(material)

    db.commit()


    return {

        "message":
            "Study material deleted successfully",

        "material_id":
            material_id
    }


# ==========================================
# GET QUIZ HISTORY
# ==========================================

@router.get("/quiz-history")
def get_quiz_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    results = (
        db.query(QuizResult)
        .filter(
            QuizResult.user_id
            == current_user.id
        )
        .order_by(
            QuizResult.id.desc()
        )
        .all()
    )

    return {

        "total_results":
            len(results),

        "quiz_history": [

            {
                "result_id":
                    result.id,

                "material_id":
                    result.material_id,

                "score":
                    result.score,

                "total_questions":
                    result.total_questions,

                "correct_answers":
                    result.correct_answers,

                "wrong_answers":
                    result.wrong_answers
            }

            for result in results
        ]
    }