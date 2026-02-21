from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pathlib import Path
import json
from datetime import datetime

router = APIRouter(prefix="/api", tags=["templates"])

TEMPLATES_DIR = Path(__file__).parent.parent / "data" / "templates"
TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)


class TemplateSaveRequest(BaseModel):
    name: str
    description: str
    config: dict  # the full onboarding payload


@router.get("/templates")
def list_templates():
    """List all saved templates."""
    templates = []
    for f in TEMPLATES_DIR.glob("*.json"):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            templates.append({
                "id": f.stem,
                "name": data.get("name", f.stem),
                "description": data.get("description", ""),
                "created_at": data.get("created_at", ""),
            })
        except Exception:
            continue
    return {"templates": templates}


@router.get("/templates/{template_id}")
def get_template(template_id: str):
    """Load a specific template."""
    path = TEMPLATES_DIR / f"{template_id}.json"
    if not path.exists():
        return JSONResponse(status_code=404, content={"error": "Template not found"})
    data = json.loads(path.read_text(encoding="utf-8"))
    return data


@router.post("/templates")
def save_template(req: TemplateSaveRequest):
    """Save current config as a reusable template."""
    template_id = req.name.lower().replace(" ", "_").replace("-", "_")
    template_id = "".join(c for c in template_id if c.isalnum() or c == "_")

    data = {
        "name": req.name,
        "description": req.description,
        "config": req.config,
        "created_at": datetime.utcnow().isoformat(),
    }

    path = TEMPLATES_DIR / f"{template_id}.json"
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")

    return {"status": "saved", "id": template_id, "name": req.name}


@router.delete("/templates/{template_id}")
def delete_template(template_id: str):
    """Delete a template."""
    path = TEMPLATES_DIR / f"{template_id}.json"
    if not path.exists():
        return JSONResponse(status_code=404, content={"error": "Template not found"})
    path.unlink()
    return {"status": "deleted", "id": template_id}
