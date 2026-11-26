from pydantic import BaseModel, Field



class ResumeAnalysisResponse(BaseModel):
    resume_id: int
    analysis: str
    ats_score: dict



class JobMatchRequest(BaseModel):
    resume_id: int
    job_id: int


class JobMatchResponse(BaseModel):
    resume_id: int
    job_id: int
    analysis: str



class CareerAdviceRequest(BaseModel):
    career_goal: str
    current_skills: str
    experience_level: str
    interests: str | None = None


class CareerAdviceResponse(BaseModel):
    career_goal: str
    advice: str



class LearningRoadmapRequest(BaseModel):
    career_goal: str
    current_skills: str
    experience_level: str

    available_hours_per_week: int = Field(
        gt=0,
        le=168,
    )

    target_months: int = Field(
        gt=0,
        le=60,
    )


class LearningRoadmapResponse(BaseModel):
    career_goal: str
    roadmap: str



class CoverLetterRequest(BaseModel):
    resume_id: int
    job_id: int
    tone: str = "professional"


class CoverLetterResponse(BaseModel):
    resume_id: int
    job_id: int
    cover_letter: str



class InterviewPrepRequest(BaseModel):
    resume_id: int
    job_id: int

    number_of_questions: int = Field(
        default=10,
        ge=1,
        le=30,
    )


class InterviewPrepResponse(BaseModel):
    resume_id: int
    job_id: int
    interview_questions: str



class DashboardAnalyticsResponse(BaseModel):
    total_jobs: int
    total_applications: int
    total_saved_jobs: int
    total_resumes: int

    application_status: dict[str, int]

    recent_applications: list[dict]
