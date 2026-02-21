from fastapi import APIRouter, Query
from typing import Optional
from app.services.parameter_service import filter_parameters
from app.schemas import ParameterOut

router = APIRouter(prefix="/api", tags=["parameters"])


@router.get("/parameters", response_model=list[ParameterOut])
def get_parameters(asset_types: Optional[str] = Query(None, description="Comma-separated asset types")):
    """
    Load parameter registry, optionally filtered by asset type(s).
    Example: /api/parameters?asset_types=boiler,turbine
    """
    types_list = []
    if asset_types:
        types_list = [t.strip() for t in asset_types.split(",") if t.strip()]
    return filter_parameters(types_list)
