from pydantic import BaseModel, EmailStr
from typing import Optional


# --- Parameter Models ---

class ParameterOut(BaseModel):
    name: str
    display_name: str
    unit: str
    category: str  # input | output | calculated
    section: str
    applicable_asset_types: list[str]


# --- Formula Validation ---

class FormulaValidationRequest(BaseModel):
    expression: str
    enabled_parameters: list[str]


class FormulaValidationResponse(BaseModel):
    valid: bool
    depends_on: list[str]
    error: Optional[str] = None


# --- Onboarding Payload ---

class PlantInfo(BaseModel):
    name: str
    address: str
    manager_email: str
    description: Optional[str] = ""


class Asset(BaseModel):
    name: str
    display_name: str
    asset_type: str


class ParameterConfig(BaseModel):
    name: str
    display_name: str
    unit: str
    category: str
    section: str
    enabled: bool = True


class FormulaConfig(BaseModel):
    parameter_name: str
    expression: str
    depends_on: list[str] = []


class OnboardingPayload(BaseModel):
    plant: PlantInfo
    assets: list[Asset]
    parameters: list[ParameterConfig]
    formulas: list[FormulaConfig] = []
