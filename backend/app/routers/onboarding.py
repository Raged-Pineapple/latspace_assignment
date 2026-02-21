from fastapi import APIRouter
from app.schemas import OnboardingPayload
from datetime import datetime

router = APIRouter(prefix="/api", tags=["onboarding"])


@router.post("/onboarding")
def submit_onboarding(payload: OnboardingPayload):
    """
    Accept the final onboarding JSON payload.
    In production this would persist to a database.
    For now, log and return confirmation.
    """
    return {
        "status": "success",
        "message": f"Plant '{payload.plant.name}' onboarded successfully",
        "summary": {
            "plant_name": payload.plant.name,
            "num_assets": len(payload.assets),
            "num_parameters": len(payload.parameters),
            "num_formulas": len(payload.formulas),
            "submitted_at": datetime.utcnow().isoformat()
        }
    }
