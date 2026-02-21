"""
Unit tests for core backend logic.

Tests cover:
  - Formula validation (syntax, safety, variable resolution)
  - Parameter service (loading, filtering)
  - AI suggestion engine (keyword matching)

Run:
    cd backend
    python -m pytest tests/ -v
"""

import pytest
import sys
import os

# Add parent dir to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.formula_validator import validate_formula
from app.services.parameter_service import load_parameters, filter_parameters
from app.services.ai_suggester import suggest_parameters


# ════════════════════════════════════════════════════════════════
# Formula Validator Tests
# ════════════════════════════════════════════════════════════════

class TestFormulaValidator:
    """Tests for the formula validation engine."""

    def test_valid_simple_formula(self):
        result = validate_formula(
            "steam_generation / coal_consumption * 100",
            ["steam_generation", "coal_consumption"]
        )
        assert result["valid"] is True
        assert result["error"] is None
        assert "steam_generation" in result["depends_on"]
        assert "coal_consumption" in result["depends_on"]

    def test_valid_formula_with_math(self):
        result = validate_formula(
            "power_generation + auxiliary_power",
            ["power_generation", "auxiliary_power"]
        )
        assert result["valid"] is True
        assert len(result["depends_on"]) == 2

    def test_missing_parameter(self):
        result = validate_formula(
            "steam_generation / coal_consumption",
            ["steam_generation"]  # coal_consumption not enabled
        )
        assert result["valid"] is False
        assert "coal_consumption" in result["error"]

    def test_multiple_missing_parameters(self):
        result = validate_formula(
            "a + b + c",
            ["a"]  # b and c missing
        )
        assert result["valid"] is False
        assert "not enabled" in result["error"]

    def test_unsafe_import(self):
        result = validate_formula(
            "import os; os.system('rm -rf /')",
            ["os"]
        )
        assert result["valid"] is False
        assert "Unsafe token" in result["error"]

    def test_unsafe_eval(self):
        result = validate_formula(
            "eval('malicious_code')",
            ["malicious_code"]
        )
        assert result["valid"] is False
        assert "Unsafe token" in result["error"]

    def test_unsafe_exec(self):
        result = validate_formula("exec('print(1)')", [])
        assert result["valid"] is False

    def test_unsafe_dunder(self):
        result = validate_formula("__builtins__", [])
        assert result["valid"] is False
        assert "Unsafe token" in result["error"]

    def test_syntax_error(self):
        result = validate_formula(
            "steam_generation / / coal_consumption",
            ["steam_generation", "coal_consumption"]
        )
        assert result["valid"] is False
        assert "Syntax error" in result["error"]

    def test_empty_expression(self):
        """Empty expression is a syntax error."""
        result = validate_formula("", [])
        assert result["valid"] is False

    def test_math_builtins_not_treated_as_variables(self):
        """Math builtins like abs, max, min should not be flagged as missing."""
        result = validate_formula(
            "abs(steam_generation - coal_consumption)",
            ["steam_generation", "coal_consumption"]
        )
        assert result["valid"] is True

    def test_numeric_only_expression(self):
        result = validate_formula("100 + 200 * 3", [])
        assert result["valid"] is True
        assert result["depends_on"] == []

    def test_depends_on_sorted(self):
        result = validate_formula(
            "z_param + a_param",
            ["z_param", "a_param"]
        )
        assert result["valid"] is True
        assert result["depends_on"] == ["a_param", "z_param"]


# ════════════════════════════════════════════════════════════════
# Parameter Service Tests
# ════════════════════════════════════════════════════════════════

class TestParameterService:
    """Tests for the parameter loading and filtering service."""

    def test_load_all_parameters(self):
        params = load_parameters()
        assert isinstance(params, list)
        assert len(params) > 0

    def test_parameter_structure(self):
        params = load_parameters()
        required_keys = {"name", "display_name", "unit", "category", "section", "applicable_asset_types"}
        for p in params:
            assert required_keys.issubset(set(p.keys())), f"Missing keys in {p['name']}"

    def test_filter_by_boiler(self):
        params = filter_parameters(["boiler"])
        assert len(params) > 0
        for p in params:
            assert "boiler" in p["applicable_asset_types"]

    def test_filter_by_turbine(self):
        params = filter_parameters(["turbine"])
        assert len(params) > 0
        for p in params:
            assert "turbine" in p["applicable_asset_types"]

    def test_filter_by_multiple(self):
        boiler_only = filter_parameters(["boiler"])
        turbine_only = filter_parameters(["turbine"])
        combined = filter_parameters(["boiler", "turbine"])
        # Combined should be >= max of individual (due to overlap in PLANT SUMMARY)
        assert len(combined) >= max(len(boiler_only), len(turbine_only))

    def test_filter_empty_returns_all(self):
        all_params = load_parameters()
        filtered = filter_parameters([])
        assert len(filtered) == len(all_params)

    def test_filter_nonexistent_type(self):
        params = filter_parameters(["nonexistent_type"])
        assert len(params) == 0

    def test_categories_valid(self):
        params = load_parameters()
        valid_categories = {"input", "output", "calculated"}
        for p in params:
            assert p["category"] in valid_categories, f"Invalid category in {p['name']}: {p['category']}"


# ════════════════════════════════════════════════════════════════
# AI Suggester Tests
# ════════════════════════════════════════════════════════════════

class TestAISuggester:
    """Tests for the keyword-based AI parameter suggestion engine."""

    def test_cement_keyword(self):
        suggestions = suggest_parameters("Large cement manufacturing plant", ["boiler"])
        names = {s["name"] for s in suggestions}
        assert "clinker_production" in names
        assert "kiln_temperature" in names

    def test_power_keyword(self):
        suggestions = suggest_parameters("Coal-fired power generation station", ["turbine"])
        names = {s["name"] for s in suggestions}
        assert "gross_generation" in names

    def test_steel_keyword(self):
        suggestions = suggest_parameters("Integrated steel plant with blast furnace", [])
        names = {s["name"] for s in suggestions}
        assert "hot_metal_production" in names

    def test_asset_type_triggers(self):
        """Asset types themselves should trigger suggestions."""
        suggestions = suggest_parameters("", ["boiler"])
        assert len(suggestions) > 0

    def test_no_match(self):
        suggestions = suggest_parameters("Generic text about nothing specific", ["unknown"])
        # May still match if "unknown" doesn't hit any rules
        assert isinstance(suggestions, list)

    def test_no_duplicates(self):
        suggestions = suggest_parameters("boiler boiler boiler", ["boiler"])
        names = [s["name"] for s in suggestions]
        assert len(names) == len(set(names))

    def test_reason_included(self):
        suggestions = suggest_parameters("cement plant", [])
        for s in suggestions:
            assert "reason" in s
            assert "cement" in s["reason"]

    def test_multiple_keywords(self):
        """Multiple keywords should combine suggestions."""
        suggestions = suggest_parameters("A power plant with cement production", [])
        names = {s["name"] for s in suggestions}
        # Should have both cement and power params
        assert "clinker_production" in names
        assert "gross_generation" in names


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
