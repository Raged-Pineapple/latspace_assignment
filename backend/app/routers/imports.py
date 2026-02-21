from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import csv
import io

router = APIRouter(prefix="/api", tags=["import"])


@router.post("/import-parameters")
async def import_parameters(file: UploadFile = File(...)):
    """
    Import parameters from a CSV/Excel file.
    Expected columns: name, display_name, unit, category, section
    """
    if not file.filename:
        return JSONResponse(status_code=400, content={"error": "No file provided"})

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ("csv", "tsv", "txt"):
        return JSONResponse(
            status_code=400,
            content={"error": f"Unsupported file type: .{ext}. Please upload a CSV file."},
        )

    content = await file.read()
    text = content.decode("utf-8-sig")  # Handle BOM
    reader = csv.DictReader(io.StringIO(text))

    required_cols = {"name", "display_name", "unit", "category", "section"}
    if not reader.fieldnames or not required_cols.issubset(set(reader.fieldnames)):
        missing = required_cols - set(reader.fieldnames or [])
        return JSONResponse(
            status_code=400,
            content={"error": f"Missing required columns: {', '.join(sorted(missing))}"},
        )

    parameters = []
    errors = []
    for i, row in enumerate(reader, start=2):
        name = row.get("name", "").strip()
        if not name:
            errors.append(f"Row {i}: missing name")
            continue
        if row.get("category", "").strip() not in ("input", "output", "calculated"):
            errors.append(f"Row {i}: invalid category '{row.get('category', '')}'")
            continue
        parameters.append({
            "name": name,
            "display_name": row.get("display_name", name).strip(),
            "unit": row.get("unit", "").strip(),
            "category": row.get("category", "input").strip(),
            "section": row.get("section", "IMPORTED").strip(),
            "applicable_asset_types": [],
            "enabled": True,
        })

    return {
        "parameters": parameters,
        "count": len(parameters),
        "errors": errors,
    }
