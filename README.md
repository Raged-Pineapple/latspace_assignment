# Plant Onboarding Wizard

A full-stack guided onboarding wizard for industrial plant configuration.

## Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js + TypeScript | Multi-step wizard UI |
| Backend | FastAPI + Python | Parameter registry, validation, AI suggestions |
| Data | JSON files | Version-controlled parameter catalog |

## Quick Start

### Option 1: Docker (Recommended)
```bash
docker-compose up --build
```

### Option 2: Local Development
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

Open **http://localhost:3000**

## Features

### Core
- 5-step guided wizard (Plant Info > Assets > Parameters > Formulas > Review)
- Real-time formula validation with debounced backend calls
- Parameter filtering by asset type from a versioned registry
- JSON preview & download, full submission API

### Stretch Goals
- AI-assisted parameter suggestion (keyword engine)
- CSV import for bulk parameter upload
- Template system (save/load/delete configs)
- Light/dark theme toggle
- localStorage persistence (resume wizard on reload)

## Testing
```bash
cd backend
pip install pytest
python -m pytest tests/ -v
```

## Documentation
See [DOCUMENTATION.md](./DOCUMENTATION.md) for:
- AI prompt engineering reasoning
- Formula validation safety design
- Performance considerations
- Error handling strategy
