from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ApplicationCreate(BaseModel):
    job_id: int
    resume_version: str | None = None
    cover_letter: str | None = None
    notes: str | None = None


class ApplicationStatusUpdate(BaseModel):
    status: str


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    status: str
    resume_version: str | None
    cover_letter: str | None
    notes: str | None
    applied_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )