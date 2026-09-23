from fastapi import APIRouter, Depends, HTTPException

from routers.auth import get_current_user
from schemas.assistant import (
    AssistantChatRequest,
    AssistantChatResponse
)
from ai import chat_with_assistant


router = APIRouter(
    prefix="/api/assistant",
    tags=["AI Assistant"]
)


@router.post(
    "/chat",
    response_model=AssistantChatResponse
)
def chat(
    request: AssistantChatRequest,
    current_user=Depends(get_current_user)
):

    try:
        reply = chat_with_assistant(request.message)

        return {
            "reply": reply
        }

    except Exception as e:
        print("AI Assistant error:", e)

        raise HTTPException(
            status_code=500,
            detail="Failed to get a response from the AI assistant."
        )