import os

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)


def generate_summary(text: str):

    response = client.responses.create(
        model="gpt-5-mini",
        instructions=(
            "You are an AI study assistant. "
            "Summarize the student's study material clearly and simply. "
            "Keep the important concepts, definitions, and key points. "
            "Use headings and bullet points where helpful. "
            "Do not add information that is not present in the material."
        ),
        input=text
    )

    return response.output_text