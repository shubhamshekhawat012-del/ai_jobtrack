from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SavedJobCreate(BaseModel):
    job_id: int


class SavedJobResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    saved_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )