# Plant Onboarding Wizard

A full-stack guided onboarding wizard for industrial plant configuration.

## Track Selection
**Track B: The Full-Stack Wizard**

I chose this track because I have a unique skill in designing and building end-to-end pipelines, and I find the problem of streamlining industrial onboarding to be a genuine gap many companies face nowadays. Building a robust bridge between complex field descriptions and structured asset configuration is critical for modern industrial data platforms.

## Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js + TypeScript | Multi-step wizard UI |
| Backend | FastAPI + Python | Parameter registry, validation, AI suggestions |
| Data | JSON files | Version-controlled parameter catalog |

### Key Decisions & Tradeoffs
- **Keyword-based Suggestion Engine**: Chose a deterministic rule-engine over a LLM to ensure zero-latency, zero-cost, and 100% safety for industrial parameters, while still providing "intelligent" suggestions based on plant descriptions.
- **Stateless Backend**: The backend is designed for high concurrency by keeping wizard state in the client's `localStorage` and persisting configurations as JSON templates.
- **Safety-First Formula Validation**: Instead of `eval()`, we use Python's `compile()` mode combined with a strict token blocklist to validate logic without execution risk.

## Quick Start

### Option 1: Railway (Fastest Deployment)
Railway is extremely fast and handles Docker automatically.
1. Create a [Railway](https://railway.app/) account.
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select your repository.
4. Railway will detect the root and ask which service to deploy. You need to deploy **two** services from the same repo:
   - **Backend**: Set "Source Directory" to `/backend` (or let it detect Dockerfile). Ensure Port is **8000**.
   - **Frontend**: Set "Source Directory" to `/frontend`. Set environment variable `NEXT_PUBLIC_API_URL` to your Backend's Railway URL.

### Option 2: Render (Free Tier Tip)
If Render asks for payment, it's because of the "Disk" storage in `render.yaml`. To use the **Free Tier**, you can deploy the services manually without a Disk:
1. **Backend**: New Web Service -> Select Repo -> Root Dir: `backend` -> Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
2. **Frontend**: New Web Service -> Select Repo -> Root Dir: `frontend` -> Add Env Var `NEXT_PUBLIC_API_URL`.

### Option 3: Docker (Local)
```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\pip.exe install -r requirements.txt
python seed_data.py
venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (new terminal)
cd frontend
npm install
npx next dev --port 3000
```

Open **http://localhost:3000**

## Features

- **Guided 5-Step Process**: Interactive flow from plant setup to final review.
- **Real-time Validation**: Instant formula checking with dependency resolution.
- **AI-Assisted Suggestions**: Context-aware parameter recommendations.
- **Bulk Import/Export**: Support for CSV parameter ingestion and JSON template management.
- **Aesthetic UI**: Dark/Light mode toggle with responsive glassmorphism design.

## Future Improvements
- **True LLM Integration**: Upgrade the suggestion engine to use a specialized RAG (Retrieval-Augmented Generation) pipeline for even more nuanced parameter mapping.
- **RBAC (Role Based Access Control)**: Add authentication layers for different user roles (Ops Manager vs. Data Engineer).
- **Advanced Formula Functions**: Support for more complex industrial calculations with time-series historical data integration.
- **Relational Database**: Transition from file-based templates to a relational DB (PostgreSQL) for enterprise-scale scaling.

## Testing
```bash
cd backend
pip install pytest
python -m pytest tests/ -v
```

## Documentation
See [DOCUMENTATION.md](./DOCUMENTATION.md) for deeper technical details.
