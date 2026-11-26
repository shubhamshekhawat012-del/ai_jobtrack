from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies.auth import get_current_user
from ..models.job import Job
from ..models.saved_job import SavedJob
from ..models.user import User
from ..schemas.saved_job import (
    SavedJobCreate,
    SavedJobResponse,
)


router = APIRouter(
    prefix="/api/saved-jobs",
    tags=["Saved Jobs"],
)


@router.post(
    "/",
    response_model=SavedJobResponse,
    status_code=status.HTTP_201_CREATED,
)
def save_job(
    saved_job_data: SavedJobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = (
        db.query(Job)
        .filter(Job.id == saved_job_data.job_id)
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    existing_saved_job = (
        db.query(SavedJob)
        .filter(
            SavedJob.user_id == current_user.id,
            SavedJob.job_id == saved_job_data.job_id,
        )
        .first()
    )

    if existing_saved_job:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Job is already saved.",
        )

    saved_job = SavedJob(
        user_id=current_user.id,
        job_id=saved_job_data.job_id,
    )

    db.add(saved_job)
    db.commit()
    db.refresh(saved_job)

    return saved_job


@router.get(
    "/",
    response_model=list[SavedJobResponse],
)
def get_saved_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved_jobs = (
        db.query(SavedJob)
        .filter(SavedJob.user_id == current_user.id)
        .order_by(SavedJob.saved_at.desc())
        .all()
    )

    return saved_jobs


@router.delete(
    "/{job_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_saved_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved_job = (
        db.query(SavedJob)
        .filter(
            SavedJob.user_id == current_user.id,
            SavedJob.job_id == job_id,
        )
        .first()
    )

    if saved_job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved job not found",
        )

    db.delete(saved_job)
    db.commit()

    return None