from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import parameters, formulas, onboarding, suggestions, imports, templates

app = FastAPI(
    title="Plant Onboarding API",
    description="Backend for the plant onboarding wizard",
    version="1.0.0"
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(parameters.router)
app.include_router(formulas.router)
app.include_router(onboarding.router)
app.include_router(suggestions.router)
app.include_router(imports.router)
app.include_router(templates.router)


@app.get("/")
def root():
    return {"message": "Plant Onboarding API is running"}
