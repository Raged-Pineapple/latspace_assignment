import json
import re

UNSAFE_TOKENS = {"import", "eval", "exec", "__", "open", "os", "sys", "subprocess"}
ALLOWED_OPERATORS = set("+-*/()., 0123456789")


def validate_formula(expression: str, enabled_parameters: list[str]) -> dict:
    """
    Validate a formula expression.
    - Extract variable names
    - Check all referenced params are enabled
    - Block unsafe tokens
    Returns dict with valid, depends_on, error.
    """
    # 1. Check for unsafe tokens
    for token in UNSAFE_TOKENS:
        if token in expression:
            return {
                "valid": False,
                "depends_on": [],
                "error": f"Unsafe token detected: '{token}'"
            }

    # 2. Extract variable names (identifiers that are not Python math builtins)
    math_builtins = {"abs", "round", "min", "max", "sum", "pow", "sqrt", "log", "sin", "cos", "tan", "pi", "e"}
    identifiers = set(re.findall(r'[a-zA-Z_][a-zA-Z0-9_]*', expression))
    variables = identifiers - math_builtins

    # 3. Check all variables are in enabled parameters
    missing = variables - set(enabled_parameters)
    if missing:
        return {
            "valid": False,
            "depends_on": list(variables),
            "error": f"Parameter(s) not enabled: {', '.join(sorted(missing))}"
        }

    # 4. Try basic syntax validation by compiling
    try:
        # Replace variables with 1.0 to test syntax
        test_expr = expression
        for var in sorted(variables, key=len, reverse=True):
            test_expr = test_expr.replace(var, "1.0")
        compile(test_expr, "<formula>", "eval")
    except SyntaxError as e:
        return {
            "valid": False,
            "depends_on": list(variables),
            "error": f"Syntax error: {str(e)}"
        }

    return {
        "valid": True,
        "depends_on": sorted(list(variables)),
        "error": None
    }
