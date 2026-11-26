from datetime import datetime

from pydantic import BaseModel, HttpUrl, ConfigDict


class JobCreate(BaseModel):
    title: str
    company: str
    location: str | None = None
    job_type: str | None = None
    experience_level: str | None = None
    description: str
    required_skills: str | None = None
    salary: str | None = None
    application_url: HttpUrl | None = None


class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    location: str | None
    job_type: str | None
    experience_level: str | None
    description: str
    required_skills: str | None
    salary: str | None
    application_url: str | None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )