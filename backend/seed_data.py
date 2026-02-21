"""
Seed Data Script for Plant Onboarding Wizard (Track B)

Populates the parameter registry and creates a sample template
to demonstrate the system's capabilities.

Usage:
    cd backend
    python seed_data.py
"""

import json
from pathlib import Path

DATA_DIR = Path(__file__).parent / "app" / "data"
TEMPLATES_DIR = DATA_DIR / "templates"
TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)

# ── 1. Verify parameter registry exists ──────────────────────────
registry_path = DATA_DIR / "parameter_registry.json"
params = json.loads(registry_path.read_text(encoding="utf-8"))
print(f"[OK] Parameter registry loaded: {len(params)} parameters")

# Print summary by section
sections: dict[str, int] = {}
for p in params:
    sections[p["section"]] = sections.get(p["section"], 0) + 1
for section, count in sections.items():
    print(f"   {section}: {count} parameters")

# ── 2. Create a sample template ──────────────────────────────────
sample_template = {
    "name": "Standard Power Plant",
    "description": "A typical coal-fired cogeneration power plant with boiler and turbine",
    "created_at": "2026-01-01T00:00:00",
    "config": {
        "plant": {
            "name": "Demo Cogeneration Plant",
            "address": "Industrial Area, Phase II, Mumbai",
            "manager_email": "ops.manager@demoplant.com",
            "description": "A 200MW coal-fired cogeneration facility with one boiler and one turbine"
        },
        "assets": [
            {"name": "main_boiler", "display_name": "Main Boiler", "asset_type": "boiler"},
            {"name": "primary_turbine", "display_name": "Primary Turbine", "asset_type": "turbine"}
        ],
        "parameters": [
            {"name": "coal_consumption", "display_name": "Coal Consumption", "unit": "MT", "category": "input", "section": "COGEN BOILER", "applicable_asset_types": ["boiler"], "enabled": True},
            {"name": "steam_generation", "display_name": "Steam Generation", "unit": "TPH", "category": "output", "section": "COGEN BOILER", "applicable_asset_types": ["boiler"], "enabled": True},
            {"name": "boiler_efficiency", "display_name": "Boiler Efficiency", "unit": "%", "category": "calculated", "section": "COGEN BOILER", "applicable_asset_types": ["boiler"], "enabled": True},
            {"name": "feed_water_temperature", "display_name": "Feed Water Temperature", "unit": "°C", "category": "input", "section": "COGEN BOILER", "applicable_asset_types": ["boiler"], "enabled": True},
            {"name": "power_generation", "display_name": "Power Generation", "unit": "MW", "category": "output", "section": "TURBINE", "applicable_asset_types": ["turbine"], "enabled": True},
            {"name": "turbine_efficiency", "display_name": "Turbine Efficiency", "unit": "%", "category": "calculated", "section": "TURBINE", "applicable_asset_types": ["turbine"], "enabled": True},
        ],
        "formulas": [
            {"parameter_name": "boiler_efficiency", "expression": "steam_generation / coal_consumption * 100", "depends_on": ["steam_generation", "coal_consumption"]},
            {"parameter_name": "turbine_efficiency", "expression": "power_generation / steam_generation * 100", "depends_on": ["power_generation", "steam_generation"]},
        ]
    }
}

template_path = TEMPLATES_DIR / "standard_power_plant.json"
template_path.write_text(json.dumps(sample_template, indent=2), encoding="utf-8")
print(f"\n[OK] Sample template created: {template_path.name}")

# ── 3. Create a second template ──────────────────────────────────
cooling_template = {
    "name": "Cooling Tower Plant",
    "description": "A plant with cooling tower focus for water efficiency monitoring",
    "created_at": "2026-01-01T00:00:00",
    "config": {
        "plant": {
            "name": "Aqua Cooling Facility",
            "address": "Sector 5, Noida, UP",
            "manager_email": "cooling@aquaplant.com",
            "description": "Water cooling and recirculation facility"
        },
        "assets": [
            {"name": "tower_a", "display_name": "Tower A", "asset_type": "cooling_tower"}
        ],
        "parameters": [
            {"name": "cooling_water_flow", "display_name": "Cooling Water Flow", "unit": "m³/hr", "category": "input", "section": "COOLING TOWER", "applicable_asset_types": ["cooling_tower"], "enabled": True},
            {"name": "cooling_water_inlet_temp", "display_name": "Cooling Water Inlet Temp", "unit": "°C", "category": "input", "section": "COOLING TOWER", "applicable_asset_types": ["cooling_tower"], "enabled": True},
            {"name": "cooling_water_outlet_temp", "display_name": "Cooling Water Outlet Temp", "unit": "°C", "category": "output", "section": "COOLING TOWER", "applicable_asset_types": ["cooling_tower"], "enabled": True},
            {"name": "approach_temperature", "display_name": "Approach Temperature", "unit": "°C", "category": "calculated", "section": "COOLING TOWER", "applicable_asset_types": ["cooling_tower"], "enabled": True},
        ],
        "formulas": [
            {"parameter_name": "approach_temperature", "expression": "cooling_water_outlet_temp - cooling_water_inlet_temp", "depends_on": ["cooling_water_outlet_temp", "cooling_water_inlet_temp"]},
        ]
    }
}

template2_path = TEMPLATES_DIR / "cooling_tower_plant.json"
template2_path.write_text(json.dumps(cooling_template, indent=2), encoding="utf-8")
print(f"[OK] Sample template created: {template2_path.name}")

print("\nSeed data complete! Templates are ready to load from the wizard.")
