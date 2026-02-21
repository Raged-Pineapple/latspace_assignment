from fastapi import APIRouter, UploadFile, File
from app.services.ai_suggester import suggest_parameters
from pydantic import BaseModel
import csv
import io

router = APIRouter(prefix="/api", tags=["suggestions"])


class SuggestionRequest(BaseModel):
    description: str
    asset_types: list[str]


@router.post("/suggest-parameters")
def suggest_params(req: SuggestionRequest):
    """
    AI-assisted parameter suggestion based on plant description and asset types.
    Returns a list of suggested parameters with reasons.
    """
    suggestions = suggest_parameters(req.description, req.asset_types)
    return {
        "suggestions": suggestions,
        "count": len(suggestions),
    }
