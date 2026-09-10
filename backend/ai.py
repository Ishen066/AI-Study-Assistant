import os
import json

from dotenv import load_dotenv
from openai import OpenAI


# Load backend/.env
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_FILE)


# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")


# OpenRouter uses OpenAI-compatible API
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
                    "You are an AI study assistant. "
                    "Create multiple-choice questions from the student's "
                    "study material. "
                    "Use only information available in the provided material. "
                    "Each question must have exactly four options: A, B, C, and D. "
                    "Only one option should be correct. "
                    "Return ONLY valid JSON. "
                    "Do not include markdown or extra text. "
                    "Use this exact JSON format: "
                    '{"questions": ['
                    '{"question": "Question text", '
                    '"option_a": "Option A", '
                    '"option_b": "Option B", '
                    '"option_c": "Option C", '
                    '"option_d": "Option D", '
                    '"correct_answer": "A"}'
                    "]}"
                )
            },
            {
                "role": "user",
                "content": (
                    f"Create {number_of_questions} multiple-choice questions "
                    f"from this study material:\n\n{text}"
                )
            }
        ]
    )

    result = response.choices[0].message.content

    return json.loads(result)