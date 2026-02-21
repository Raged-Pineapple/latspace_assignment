.PHONY: install dev test seed docker clean

# ── Quick Start ──────────────────────────────────────────────────
install:  ## Install all dependencies
	cd backend && python -m venv venv && venv\Scripts\pip.exe install -r requirements.txt && venv\Scripts\pip.exe install pytest
	cd frontend && npm install

dev:  ## Start both servers for development
	start /B cmd /C "cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
	cd frontend && npx next dev --port 3000

# ── Backend ──────────────────────────────────────────────────────
seed:  ## Run seed data script
	cd backend && venv\Scripts\python.exe seed_data.py

test:  ## Run unit tests
	cd backend && venv\Scripts\python.exe -m pytest tests/ -v

# ── Docker ───────────────────────────────────────────────────────
docker:  ## Build and run with Docker Compose
	docker-compose up --build

docker-down:  ## Stop Docker containers
	docker-compose down

# ── Cleanup ──────────────────────────────────────────────────────
clean:  ## Remove generated files
	if exist backend\venv rmdir /s /q backend\venv
	if exist frontend\node_modules rmdir /s /q frontend\node_modules
	if exist frontend\.next rmdir /s /q frontend\.next

help:  ## Show this help
	@echo Available commands:
	@echo   make install    - Install all dependencies
	@echo   make dev        - Start dev servers
	@echo   make seed       - Seed sample data
	@echo   make test       - Run unit tests
	@echo   make docker     - Run with Docker
	@echo   make docker-down - Stop Docker
	@echo   make clean      - Remove generated files
