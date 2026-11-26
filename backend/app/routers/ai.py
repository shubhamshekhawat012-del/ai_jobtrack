from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies.auth import get_current_user

from ..models.application import Application
from ..models.job import Job
from ..models.resume import Resume
from ..models.saved_job import SavedJob
from ..models.user import User

from ..schemas.ai import (
    CareerAdviceRequest,
    CareerAdviceResponse,

    CoverLetterRequest,
    CoverLetterResponse,

    DashboardAnalyticsResponse,

    InterviewPrepRequest,
    InterviewPrepResponse,

    JobMatchRequest,
    JobMatchResponse,

    LearningRoadmapRequest,
    LearningRoadmapResponse,

    ResumeAnalysisResponse,
)

from ..services.career_ai_service import (
    generate_career_advice,
    generate_learning_roadmap,
)

from ..services.generative_ai_service import (
    generate_cover_letter,
    generate_interview_prep,
)

from ..services.job_matching_service import (
    analyze_job_match,
)

from ..services.resume_ai_service import (
    analyze_resume,
    score_ats_resume,
)


router = APIRouter(
    prefix="/api/ai",
    tags=["AI"],
)


def get_owned_resume(
    resume_id: int,
    current_user: User,
    db: Session,
) -> Resume:

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if resume is None:

        raise HTTPException(
            status_code=404,
            detail="Resume not found.",
        )

    if not resume.extracted_text:

        raise HTTPException(
            status_code=400,
            detail="Resume text has not been extracted yet.",
        )

    return resume


def get_job(
    job_id: int,
    db: Session,
) -> Job:

    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if job is None:

        raise HTTPException(
            status_code=404,
            detail="Job not found.",
        )

    return job



@router.post(
    "/resume/{resume_id}/analyze",
    response_model=ResumeAnalysisResponse,
)
def analyze_user_resume(
    resume_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    resume = get_owned_resume(
        resume_id=resume_id,
        current_user=current_user,
        db=db,
    )

    analysis = analyze_resume(
        resume.extracted_text
    )
    ats_score = score_ats_resume(resume.extracted_text)

    return {
        "resume_id": resume.id,
        "analysis": analysis,
        "ats_score": ats_score,
    }




@router.post(
    "/job-match",
    response_model=JobMatchResponse,
)
def match_resume_with_job(
    data: JobMatchRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    resume = get_owned_resume(
        resume_id=data.resume_id,
        current_user=current_user,
        db=db,
    )

    job = get_job(
        job_id=data.job_id,
        db=db,
    )

    analysis = analyze_job_match(
        resume_text=resume.extracted_text,
        job_title=job.title,
        job_description=job.description,
        required_skills=job.required_skills,
    )

    return {
        "resume_id": resume.id,
        "job_id": job.id,
        "analysis": analysis,
    }


@router.post(
    "/career-advice",
    response_model=CareerAdviceResponse,
)
def career_advice(
    data: CareerAdviceRequest,

    current_user: User = Depends(
        get_current_user
    ),
):

    advice = generate_career_advice(
        career_goal=data.career_goal,
        current_skills=data.current_skills,
        experience_level=data.experience_level,
        interests=data.interests,
    )

    return {
        "career_goal": data.career_goal,
        "advice": advice,
    }



@router.post(
    "/learning-roadmap",
    response_model=LearningRoadmapResponse,
)
def learning_roadmap(
    data: LearningRoadmapRequest,

    current_user: User = Depends(
        get_current_user
    ),
):

    roadmap = generate_learning_roadmap(
        career_goal=data.career_goal,
        current_skills=data.current_skills,
        experience_level=data.experience_level,
        available_hours_per_week=(
            data.available_hours_per_week
        ),
        target_months=data.target_months,
    )

    return {
        "career_goal": data.career_goal,
        "roadmap": roadmap,
    }



@router.post(
    "/cover-letter",
    response_model=CoverLetterResponse,
)
def cover_letter(
    data: CoverLetterRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    resume = get_owned_resume(
        resume_id=data.resume_id,
        current_user=current_user,
        db=db,
    )

    job = get_job(
        job_id=data.job_id,
        db=db,
    )

    letter = generate_cover_letter(
        resume_text=resume.extracted_text,
        job_title=job.title,
        company=job.company,
        job_description=job.description,
        tone=data.tone,
    )

    return {
        "resume_id": resume.id,
        "job_id": job.id,
        "cover_letter": letter,
    }



@router.post(
    "/interview-prep",
    response_model=InterviewPrepResponse,
)
def interview_prep(
    data: InterviewPrepRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):

    resume = get_owned_resume(
        resume_id=data.resume_id,
        current_user=current_user,
        db=db,
    )

    job = get_job(
        job_id=data.job_id,
        db=db,
    )

    questions = generate_interview_prep(
        resume_text=resume.extracted_text,
        job_title=job.title,
        job_description=job.description,
        required_skills=job.required_skills,
        number_of_questions=data.number_of_questions,
    )

    return {
        "resume_id": resume.id,
        "job_id": job.id,
        "interview_questions": questions,
    }



@router.get(
    "/dashboard-analytics",
    response_model=DashboardAnalyticsResponse,
)
def dashboard_analytics(
    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    ),
):


    total_jobs = (
        db.query(func.count(Job.id))
        .scalar()
        or 0
    )


    total_applications = (
        db.query(
            func.count(Application.id)
        )
        .filter(
            Application.user_id
            == current_user.id
        )
        .scalar()
        or 0
    )


    total_saved_jobs = (
        db.query(
            func.count(SavedJob.id)
        )
        .filter(
            SavedJob.user_id
            == current_user.id
        )
        .scalar()
        or 0
    )


 

    total_resumes = (
        db.query(
            func.count(Resume.id)
        )
        .filter(
            Resume.user_id
            == current_user.id
        )
        .scalar()
        or 0
    )



    status_rows = (
        db.query(
            Application.status,
            func.count(Application.id),
        )
        .filter(
            Application.user_id
            == current_user.id
        )
        .group_by(
            Application.status
        )
        .all()
    )

    application_status = {
        status: count
        for status, count in status_rows
    }



    recent_rows = (
        db.query(
            Application,
            Job.title,
            Job.company,
        )
        .join(
            Job,
            Job.id == Application.job_id,
        )
        .filter(
            Application.user_id
            == current_user.id
        )
        .order_by(
            Application.applied_at.desc()
        )
        .limit(5)
        .all()
    )

    recent_applications = []

    for application, job_title, company in recent_rows:

        recent_applications.append(
            {
                "application_id":
                    application.id,

                "job_id":
                    application.job_id,

                "job_title":
                    job_title,

                "company":
                    company,

                "status":
                    application.status,

                "applied_at":
                    application.applied_at.isoformat(),
            }
        )



    return {
        "total_jobs":
            total_jobs,

        "total_applications":
            total_applications,

        "total_saved_jobs":
            total_saved_jobs,

        "total_resumes":
            total_resumes,

        "application_status":
            application_status,

        "recent_applications":
            recent_applications,
    }
