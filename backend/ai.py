import os

from dotenv import load_dotenv
from openai import OpenAI


# Load backend/.env
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_FILE)


# Get OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")


# OpenRouter uses an OpenAI-compatible API
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY
)


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