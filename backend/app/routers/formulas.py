from fastapi import APIRouter
from app.schemas import FormulaValidationRequest, FormulaValidationResponse
from app.services.formula_validator import validate_formula

router = APIRouter(prefix="/api", tags=["formulas"])


@router.post("/validate-formula", response_model=FormulaValidationResponse)
def validate_formula_endpoint(req: FormulaValidationRequest):
    """
    Validate a formula expression.
    - Checks syntax
    - Ensures referenced parameters exist in enabled list
    - Blocks unsafe tokens
    """
    result = validate_formula(req.expression, req.enabled_parameters)
    return FormulaValidationResponse(**result)
