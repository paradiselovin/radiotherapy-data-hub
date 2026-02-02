# Entry point for the FastAPI
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.models import (
    article,
    experience,
    donnee,
    detector,
    machine,
    phantom,
    column_mapping,
    )
from app.routes import (
    articles,
    experiences,
    files,
    donnees,
    detectors,
    experience_detectors,
    machines,
    experience_machines,
    phantoms,
    experience_phantoms,
    complete_submission,
)


app = FastAPI(title="Dosimetry Database API")

# Creating a CORS middleware with restricted origins
# In production, replace with your actual domain(s)
ALLOWED_ORIGINS = [
    "http://localhost:8080",  # Frontend dev server (Vite)
    "http://localhost:5173",  # Alternative Vite dev server
    "http://localhost:3000",  # Alternative dev port
    "http://localhost:8000",  # Backend (for testing)
    "http://127.0.0.1:8080",  # Frontend via loopback
    "http://127.0.0.1:5173",  # Vite via loopback
    # Add production domains here when deploying:
    # "https://yourdomain.com",
    # "https://www.yourdomain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Creating tables
Base.metadata.create_all(bind=engine)

# Creating routers
app.include_router(articles.router)
app.include_router(experiences.router)
app.include_router(files.router)
app.include_router(donnees.router)

@app.get("/")
def root():
    return {"status": "API running"}


from app.routes import (
    machines,
    phantoms,
    detectors,
)

app.include_router(machines.router)
app.include_router(phantoms.router)
app.include_router(detectors.router)
app.include_router(experience_machines.router)
app.include_router(experience_phantoms.router)
app.include_router(experience_detectors.router)
app.include_router(complete_submission.router)

# Mount frontend static after API routers so API endpoints are not shadowed
# NOTE: In development, the frontend runs on a separate dev server (npm run dev)
# Uncomment the line below only when you have built the frontend (npm run build)
# app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="static")
