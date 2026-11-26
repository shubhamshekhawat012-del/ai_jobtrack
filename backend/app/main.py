from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import create_tables
from .routers import users, auth, jobs, applications, saved_jobs, resumes, ai



app = FastAPI(
    title=settings.app_name,
    description="AI-powered career and job management platform",
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    create_tables()
    
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(saved_jobs.router)
app.include_router(resumes.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {
        "message": "Welcome to AI JobTrack API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }