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
    experience_phantoms
)


app = FastAPI(title="Dosimetry Database API")

# Creating a CORS middleware with restricted origins
# In production, replace with your actual domain(s)
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative dev port
    "http://localhost:8000",  # Backend (for testing)
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

# Mount frontend static after API routers so API endpoints are not shadowed
app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="static")
