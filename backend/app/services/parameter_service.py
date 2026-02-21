import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"


def load_parameters() -> list[dict]:
    """Load all parameters from the registry."""
    registry_path = DATA_DIR / "parameter_registry.json"
    with open(registry_path, "r") as f:
        return json.load(f)


def filter_parameters(asset_types: list[str]) -> list[dict]:
    """Filter parameters by applicable asset types."""
    all_params = load_parameters()
    if not asset_types:
        return all_params
    return [
        p for p in all_params
        if any(at in p["applicable_asset_types"] for at in asset_types)
    ]
