from .ai_service import ai_service



def generate_cover_letter(
    resume_text: str,
    job_title: str,
    company: str,
    job_description: str,
    tone: str,
) -> str:

    prompt = f"""
You are an expert professional cover-letter writer.

Create a personalized cover letter for the candidate.

IMPORTANT RULES:

- Use only information supported by the resume.
- Do not invent experience.
- Do not invent companies.
- Do not invent achievements.
- Do not invent certifications.
- Do not claim skills that are not supported.
- Keep the letter professional and job-specific.
- Avoid unnecessary generic statements.

Tone:
{tone}

Candidate Resume:
----------------
{resume_text}
----------------

Job Title:
{job_title}

Company:
{company}

Job Description:
----------------
{job_description}
----------------

Generate a polished professional cover letter.
"""

    return ai_service.generate_text(prompt)



def generate_interview_prep(
    resume_text: str,
    job_title: str,
    job_description: str,
    required_skills: str | None,
    number_of_questions: int,
) -> str:

    prompt = f"""
You are an expert technical interviewer.

Prepare the candidate for an interview
for the following job.

Generate {number_of_questions} interview questions.

Include a balanced combination of:

- Technical questions
- Scenario-based questions
- Resume-based questions
- Problem-solving questions
- HR/behavioral questions

For every question provide:

Question:
The interview question.

What a Strong Answer Should Cover:
Important points the candidate should mention.

Also make some questions specifically based
on the candidate's resume.

Do not invent facts about the candidate.

JOB TITLE:
{job_title}

JOB DESCRIPTION:
----------------
{job_description}
----------------

REQUIRED SKILLS:
{required_skills or "Not specified"}

CANDIDATE RESUME:
----------------
{resume_text}
----------------
"""

    return ai_service.generate_text(prompt)