import re

# Simple keyword-based parameter suggestion engine.
# Maps plant description keywords / asset types to suggested parameter names.

SUGGESTION_RULES: dict[str, list[dict]] = {
    "cement": [
        {"name": "clinker_production", "display_name": "Clinker Production", "unit": "TPD", "category": "output", "section": "KILN"},
        {"name": "kiln_temperature", "display_name": "Kiln Temperature", "unit": "°C", "category": "input", "section": "KILN"},
        {"name": "raw_meal_feed_rate", "display_name": "Raw Meal Feed Rate", "unit": "TPH", "category": "input", "section": "KILN"},
        {"name": "specific_heat_consumption", "display_name": "Specific Heat Consumption", "unit": "kcal/kg", "category": "calculated", "section": "KILN"},
    ],
    "power": [
        {"name": "gross_generation", "display_name": "Gross Generation", "unit": "MWh", "category": "output", "section": "GENERATION"},
        {"name": "plant_load_factor", "display_name": "Plant Load Factor", "unit": "%", "category": "calculated", "section": "GENERATION"},
        {"name": "specific_oil_consumption", "display_name": "Specific Oil Consumption", "unit": "ml/kWh", "category": "calculated", "section": "FUEL"},
    ],
    "steel": [
        {"name": "hot_metal_production", "display_name": "Hot Metal Production", "unit": "TPD", "category": "output", "section": "BLAST FURNACE"},
        {"name": "coke_rate", "display_name": "Coke Rate", "unit": "kg/THM", "category": "input", "section": "BLAST FURNACE"},
        {"name": "blast_volume", "display_name": "Blast Volume", "unit": "Nm³/min", "category": "input", "section": "BLAST FURNACE"},
    ],
    "boiler": [
        {"name": "steam_flow_rate", "display_name": "Steam Flow Rate", "unit": "TPH", "category": "output", "section": "BOILER"},
        {"name": "coal_gcv", "display_name": "Coal GCV", "unit": "kcal/kg", "category": "input", "section": "FUEL"},
        {"name": "excess_air", "display_name": "Excess Air", "unit": "%", "category": "calculated", "section": "BOILER"},
    ],
    "turbine": [
        {"name": "turbine_speed", "display_name": "Turbine Speed", "unit": "RPM", "category": "input", "section": "TURBINE"},
        {"name": "condenser_vacuum", "display_name": "Condenser Vacuum", "unit": "mmHg", "category": "input", "section": "CONDENSER"},
    ],
    "cooling": [
        {"name": "wet_bulb_temperature", "display_name": "Wet Bulb Temperature", "unit": "°C", "category": "input", "section": "COOLING"},
        {"name": "evaporation_loss", "display_name": "Evaporation Loss", "unit": "m³/hr", "category": "calculated", "section": "COOLING"},
    ],
}


def suggest_parameters(description: str, asset_types: list[str]) -> list[dict]:
    """
    Suggest parameters based on plant description keywords and asset types.
    Uses keyword matching against the suggestion rules.
    """
    suggestions: list[dict] = []
    seen_names: set[str] = set()

    text = (description + " " + " ".join(asset_types)).lower()

    for keyword, params in SUGGESTION_RULES.items():
        if keyword in text:
            for p in params:
                if p["name"] not in seen_names:
                    suggestions.append({
                        **p,
                        "applicable_asset_types": asset_types,
                        "reason": f"Suggested based on keyword '{keyword}' in plant description",
                    })
                    seen_names.add(p["name"])

    return suggestions
