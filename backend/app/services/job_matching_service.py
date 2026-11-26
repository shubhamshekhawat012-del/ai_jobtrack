from .ai_service import ai_service


def analyze_job_match(
    resume_text: str,
    job_title: str,
    job_description: str,
    required_skills: str | None,
) -> str:

    prompt = f"""
You are an expert AI job matching and recruitment assistant.

Compare the candidate's resume with the job requirements.

Return the analysis using exactly these sections:

Match Score:
Give a score from 0 to 100.

Matched Skills:
List the skills from the job requirements that are present
in the candidate's resume.

Missing Skills:
List important job requirements that are missing or weak
in the candidate's resume.

Candidate Strengths:
Explain why the candidate matches the role.

Skill Gaps:
Explain the most important gaps the candidate should work on.

Recommendation:
Give a concise recommendation about how the candidate
can improve their profile for this specific job.

JOB TITLE:
{job_title}

JOB DESCRIPTION:
{job_description}

REQUIRED SKILLS:
{required_skills or "Not specified"}

CANDIDATE RESUME:
{resume_text}
"""

    return ai_service.generate_text(prompt)