from fastapi import APIRouter, Depends, HTTPException, status
from fastapi import Query
from sqlalchemy.orm import Session
from urllib.error import URLError, HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import json

from ..database import get_db
from ..models.job import Job
from ..schemas.job import JobCreate, JobResponse
from ..dependencies.auth import get_current_user


router = APIRouter(
    prefix="/api/jobs",
    tags=["Jobs"],
)


@router.get("/external")
def search_external_jobs(
    q: str = "",
    page: int = Query(1, ge=1),
    seniority: str | None = None,
    employment_type: str | None = None,
):
    """Search Himalayas' public API server-side (it does not allow browser CORS)."""
    params = {"page": page, "sort": "relevant" if q.strip() else "recent"}
    if q.strip():
        params["q"] = q.strip()
    if seniority:
        params["seniority"] = seniority
    if employment_type:
        params["employment_type"] = employment_type
    url = "https://himalayas.app/jobs/api/search?" + urlencode(params)
    try:
        request = Request(
            url,
            headers={
                "Accept": "application/json, text/plain, */*",
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/131.0.0.0 Safari/537.36"
                ),
                "Referer": "https://himalayas.app/jobs",
            },
        )
        with urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (URLError, HTTPError, TimeoutError, ValueError) as exc:
        reason = getattr(exc, "reason", None) or str(exc)
        raise HTTPException(
            status_code=502,
            detail=f"Himalayas API request failed: {reason}",
        ) from exc

    if not isinstance(payload, dict) or not isinstance(payload.get("jobs", []), list):
        raise HTTPException(status_code=502, detail="Himalayas returned an unexpected job search response")

    jobs = []
    for item in payload.get("jobs", []):
        if not isinstance(item, dict):
            continue
        salary = None
        if item.get("minSalary") is not None or item.get("maxSalary") is not None:
            low, high = item.get("minSalary"), item.get("maxSalary")
            amount = f"{low:,}" if low is not None else ""
            if high is not None:
                amount += f" - {high:,}"
            salary = " ".join(filter(None, [item.get("currency"), amount, item.get("salaryPeriod")]))
        locations = item.get("locationRestrictions") or []
        location = ", ".join(
            loc.get("name", "") for loc in locations
            if isinstance(loc, dict) and loc.get("name")
        ) or "Remote"
        categories = item.get("categories") or []
        if not isinstance(categories, list):
            categories = [str(categories)]
        employment = {
            "Full Time": "Full-time",
            "Part Time": "Part-time",
            "Contractor": "Contract",
            "Intern": "Internship",
        }.get(item.get("employmentType"), item.get("employmentType"))
        seniority = item.get("seniority") or []
        if isinstance(seniority, str):
            seniority = [seniority]
        jobs.append({
            "id": f"himalayas:{item.get('guid') or item.get('applicationLink')}",
            "title": item.get("title") or "Untitled role",
            "company": item.get("companyName") or "Company not specified",
            "location": location,
            "job_type": employment,
            "experience_level": ", ".join(seniority) or None,
            "description": item.get("excerpt") or "Remote opportunity listed on Himalayas.",
            "required_skills": ", ".join(categories) or None,
            "salary": salary,
            "application_url": item.get("applicationLink"),
            "source": "Himalayas",
        })
    return {"jobs": jobs, "total": payload.get("totalCount", len(jobs)), "page": page}


@router.post(
    "/",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job(
    job_data: JobCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    job = Job(
        title=job_data.title,
        company=job_data.company,
        location=job_data.location,
        job_type=job_data.job_type,
        experience_level=job_data.experience_level,
        description=job_data.description,
        required_skills=job_data.required_skills,
        salary=job_data.salary,
        application_url=(
            str(job_data.application_url)
            if job_data.application_url
            else None
        ),
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


@router.get(
    "/",
    response_model=list[JobResponse],
)
def get_jobs(
    db: Session = Depends(get_db),
):
    jobs = (
        db.query(Job)
        .order_by(Job.created_at.desc())
        .all()
    )

    return jobs


@router.get(
    "/{job_id}",
    response_model=JobResponse,
)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
):
    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    return job
