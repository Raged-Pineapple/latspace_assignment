# Plant Onboarding Wizard — Documentation

## Architecture Overview

```
Frontend (Next.js)  ──REST──►  Backend (FastAPI)  ──reads──►  Static Data (JSON)
     │                              │
     ├─ React state + localStorage  ├─ Parameter registry
     ├─ Real-time validation        ├─ Formula validator
     └─ JSON preview/download       ├─ AI suggester (keyword engine)
                                    └─ Template CRUD (file-based)
```

## AI Suggestion — Prompt Engineering & Reasoning

### Approach: Keyword-Based Rule Engine (Not LLM)

**Decision:** We use a deterministic keyword-matching engine instead of an LLM.

**Reasoning:**

| Consideration | LLM Approach | Keyword Engine (Chosen) |
|---|---|---|
| **Determinism** | Non-deterministic, may hallucinate params | Same input → same output, always |
| **Latency** | 1-5s API roundtrip | < 1ms, instant |
| **Cost** | $0.01-0.10 per request | Free, zero cost |
| **Offline** | Requires internet | Works offline |
| **Safety** | May suggest invalid/dangerous params | Only curated, vetted params |
| **Spec compliance** | Spec says "Never use LLM for strict validation" | Fully compliant |

**How it works:**

1. User's plant description + asset types are combined into a search string
2. The engine scans for industry keywords: `cement`, `power`, `steel`, `boiler`, `turbine`, `cooling`
3. Matching keywords trigger curated parameter suggestions from `SUGGESTION_RULES`
4. Each suggestion includes a human-readable `reason` field
5. Duplicates are prevented via a `seen_names` set
6. User explicitly confirms which suggestions to accept (never auto-added)

**Extensibility:**
- Add new keywords by adding entries to `SUGGESTION_RULES` in `ai_suggester.py`
- Can be upgraded to an LLM backend by swapping the `suggest_parameters()` function
- The API contract (`POST /api/suggest-parameters`) remains identical

## Formula Validation — Safety Design

### Threat Model
User-provided formula expressions are inherently dangerous if executed directly.

### Safeguards (Defense in Depth)

1. **Blocklist check** — Blocks `import`, `eval`, `exec`, `__`, `open`, `os`, `sys`, `subprocess`
2. **Variable extraction** — Only `[a-zA-Z_][a-zA-Z0-9_]*` identifiers are extracted
3. **Math builtin whitelist** — `abs`, `round`, `min`, `max`, `sum`, `pow`, `sqrt` are not treated as variables
4. **Parameter existence check** — All variables must be in the user's enabled parameter list
5. **Syntax validation** — Expression is compiled (not executed) via `compile()` in eval mode
6. **Never executed** — Formulas are stored as strings, never `eval()`'d at runtime

### Why not `eval()`?
Even with `ast.literal_eval`, arbitrary code execution risks exist. Our approach validates syntax without execution — the formula is only stored as a string for downstream processing.

## Performance Considerations

### Current Performance Profile

| Operation | Latency | Bottleneck |
|---|---|---|
| `GET /parameters` | < 5ms | File I/O (JSON read) |
| `POST /validate-formula` | < 1ms | Regex + compile |
| `POST /suggest-parameters` | < 1ms | Dictionary lookup |
| `POST /import-parameters` | < 10ms | CSV parsing |
| `POST /onboarding` | < 5ms | Pydantic validation |

### Scaling Recommendations (Not Implemented)

**If parameter registry grows to 10,000+ entries:**
- Move from JSON file to SQLite or PostgreSQL
- Add indexing on `applicable_asset_types`
- Cache filtered results with TTL (hash asset_types → result)

**If concurrent users > 100:**
- Add Redis for session/wizard state instead of localStorage only
- Use connection pooling for database backend
- Deploy behind Nginx reverse proxy with rate limiting

**Frontend performance:**
- Parameter list: already uses React keys for efficient re-renders
- Formula validation: debounced at 600ms to prevent API flooding
- localStorage: serialize only on state change (not on re-render)
- Step transitions: CSS animations with `will-change` for GPU acceleration

**Docker production optimizations:**
- Multi-stage builds to reduce image size
- `npm ci --omit=dev` for production frontend
- Gunicorn workers: `2 * CPU cores + 1`

## Error Handling Strategy

### Backend
- All endpoints use Pydantic models for input validation (automatic 422 on bad input)
- CSV import: row-level error reporting (doesn't fail entire import)
- Template operations: 404 for missing templates
- Formula validation: structured error response (never crashes)

### Frontend
- Network errors → user-visible error states with retry hints
- Form validation → inline errors, disabled Next button
- Loading states → spinner with descriptive text
- API failures → graceful degradation (wizard still works for local-only features)

## Testing

```bash
cd backend
pip install pytest
python -m pytest tests/ -v
```

**Test coverage:**
- 13 formula validation tests (valid, invalid, unsafe tokens, syntax errors, edge cases)
- 8 parameter service tests (load, filter, structure, edge cases)
- 8 AI suggester tests (keyword matching, deduplication, multi-keyword)

## Quick Start

### Local Development
```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\pip.exe install -r requirements.txt
python seed_data.py
venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --reload

# Frontend (new terminal)
cd frontend
npm install
npx next dev --port 3000
```

### Docker (One Command)
```bash
docker-compose up --build
```

Open http://localhost:3000
