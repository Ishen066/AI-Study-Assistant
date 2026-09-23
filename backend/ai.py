import os
import json
import re

from dotenv import load_dotenv
from openai import OpenAI


# ==========================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================

# Load backend/.env
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_FILE)


# ==========================================
# OPENROUTER API KEY
# ==========================================

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")


# ==========================================
# OPENROUTER CLIENT
# ==========================================

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY
)


# ==========================================
# AI SUMMARY
# ==========================================

def generate_summary(text: str):

    response = client.chat.completions.create(
        model="openrouter/free",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an AI study assistant. "
                    "Summarize the student's study material clearly and simply. "
                    "Keep important concepts, definitions, and key points. "
                    "Use headings and bullet points where helpful. "
                    "Do not add information that is not present in the material."
                )
            },
            {
                "role": "user",
                "content": text
            }
        ]
    )

    return response.choices[0].message.content


# ==========================================
# AI QUIZ GENERATION
# ==========================================

def generate_quiz(text: str, number_of_questions: int = 5):

    response = client.chat.completions.create(
        model="openrouter/free",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an AI study assistant that creates "
                    "multiple-choice quizzes for students.\n\n"

                    "Create questions ONLY from the provided study material.\n\n"

                    "Each question MUST contain exactly four options:\n"
                    "A, B, C, and D.\n\n"

                    "Only ONE option must be correct.\n\n"

                    "The correct_answer field MUST contain only one "
                    "letter: A, B, C, or D.\n\n"

                    "Every question MUST contain these fields:\n"
                    "- question\n"
                    "- option_a\n"
                    "- option_b\n"
                    "- option_c\n"
                    "- option_d\n"
                    "- correct_answer\n\n"

                    "Return ONLY valid JSON.\n"
                    "Do NOT use Markdown.\n"
                    "Do NOT use ```json.\n"
                    "Do NOT include explanations outside the JSON.\n\n"

                    "Use EXACTLY this JSON structure:\n\n"

                    "{\n"
                    '  "questions": [\n'
                    "    {\n"
                    '      "question": "Question text",\n'
                    '      "option_a": "Option A",\n'
                    '      "option_b": "Option B",\n'
                    '      "option_c": "Option C",\n'
                    '      "option_d": "Option D",\n'
                    '      "correct_answer": "A"\n'
                    "    }\n"
                    "  ]\n"
                    "}"
                )
            },
            {
                "role": "user",
                "content": (
                    f"Create exactly {number_of_questions} "
                    "multiple-choice questions from this study material:\n\n"
                    f"{text}"
                )
            }
        ]
    )

    result = response.choices[0].message.content

    if not result:
        raise ValueError("AI returned an empty quiz response")

    result = result.strip()

    # Remove Markdown code fences if the AI adds them
    result = re.sub(
        r"^```json\s*",
        "",
        result,
        flags=re.IGNORECASE
    )

    result = re.sub(
        r"^```\s*",
        "",
        result
    )

    result = re.sub(
        r"\s*```$",
        "",
        result
    )

    # Convert AI response to Python dictionary
    try:
        quiz_data = json.loads(result)

    except json.JSONDecodeError as e:

        raise ValueError(
            f"AI returned invalid JSON: {result[:500]}"
        ) from e

    # Check questions field
    if "questions" not in quiz_data:

        raise ValueError(
            "AI response does not contain 'questions'"
        )

    questions = quiz_data["questions"]

    if not isinstance(questions, list):

        raise ValueError(
            "'questions' must be a list"
        )

    if len(questions) == 0:

        raise ValueError(
            "AI returned no quiz questions"
        )

    # Required fields
    required_fields = [
        "question",
        "option_a",
        "option_b",
        "option_c",
        "option_d",
        "correct_answer"
    ]

    # Validate every question
    for index, question in enumerate(questions, start=1):

        if not isinstance(question, dict):

            raise ValueError(
                f"Question {index} is not a valid object"
            )

        # Check required fields
        for field in required_fields:

            if field not in question:

                raise ValueError(
                    f"Question {index} is missing field: {field}"
                )

        # Normalize correct answer
        correct_answer = str(
            question["correct_answer"]
        ).strip().upper()

        # Check correct answer
        if correct_answer not in ["A", "B", "C", "D"]:

            raise ValueError(
                f"Question {index} has invalid "
                f"correct_answer: {correct_answer}"
            )

        question["correct_answer"] = correct_answer

    # Return validated quiz data
    return {
        "questions": questions
    }


# ==========================================
# AI WEAK TOPIC ANALYSIS
# ==========================================

def analyze_weak_topics(wrong_questions):

    if not wrong_questions:
        return {
            "topics": []
        }

    questions_text = "\n".join(
        [
            f"{index + 1}. {question}"
            for index, question in enumerate(wrong_questions)
        ]
    )

    prompt = f"""
Analyze the following incorrect quiz questions from a student's study material.

Identify the main academic topics that the student appears to be weak in.

Return ONLY valid JSON in this exact format:

{{
    "topics": [
        {{
            "topic": "Topic name",
            "description": "Short explanation of why this topic needs practice",
            "recommendation": "Short recommendation for improving this topic"
        }}
    ]
}}

Do not include markdown.
Do not include explanations outside the JSON.

Incorrect questions:

{questions_text}
"""

    response = client.chat.completions.create(
        model="openrouter/free",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError(
            "AI returned an empty weak topic response"
        )

    content = content.strip()

    # Remove Markdown code fences if AI adds them
    content = re.sub(
        r"^```json\s*",
        "",
        content,
        flags=re.IGNORECASE
    )

    content = re.sub(
        r"^```\s*",
        "",
        content
    )

    content = re.sub(
        r"\s*```$",
        "",
        content
    )

    # Convert AI response to Python dictionary
    try:
        weak_topic_data = json.loads(content)

    except json.JSONDecodeError as e:

        raise ValueError(
            f"AI returned invalid weak topic JSON: {content[:500]}"
        ) from e

    # Check topics field
    if "topics" not in weak_topic_data:

        raise ValueError(
            "AI response does not contain 'topics'"
        )

    topics = weak_topic_data["topics"]

    if not isinstance(topics, list):

        raise ValueError(
            "'topics' must be a list"
        )

    # Validate every topic
    required_topic_fields = [
        "topic",
        "description",
        "recommendation"
    ]

    for index, topic in enumerate(topics, start=1):

        if not isinstance(topic, dict):

            raise ValueError(
                f"Weak topic {index} is not a valid object"
            )

        for field in required_topic_fields:

            if field not in topic:

                raise ValueError(
                    f"Weak topic {index} is missing field: {field}"
                )

    return {
        "topics": topics
    }

def chat_with_assistant(message: str) -> str:
    response = client.chat.completions.create(
        model="openrouter/free",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an AI Study Assistant for students. "
                    "Help students understand academic topics clearly and simply. "
                    "Give accurate, educational, and supportive explanations. "
                    "When useful, explain difficult concepts step by step. "
                    "Do not pretend to know information that is not provided. "
                    "Keep answers focused on studying and learning."
                )
            },
            {
                "role": "user",
                "content": message
            }
        ]
    )

    return response.choices[0].message.content