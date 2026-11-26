from .ai_service import ai_service
import re


def score_ats_resume(resume_text: str) -> dict:
    """Return a transparent, heuristic ATS-readiness estimate from extracted text."""
    text = resume_text or ""
    lower = text.lower()
    words = re.findall(r"\b[\w+#.-]+\b", text)
    sections = {
        "Contact details": (15, bool(re.search(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", text)) and bool(re.search(r"(?:\+?\d[\d ()-]{7,}\d)", text))),
        "Core resume sections": (25, sum(bool(re.search(pattern, lower)) for pattern in [r"\b(experience|employment|work history)\b", r"\b(education|academic)\b", r"\b(skills|technical skills|competencies)\b"]) ),
        "Relevant keywords": (20, len(set(re.findall(r"\b(?:python|java|javascript|typescript|sql|react|aws|azure|docker|leadership|communication|project management|data analysis)\b", lower)))),
        "Achievement evidence": (20, len(re.findall(r"\b\d+(?:\.\d+)?\s*(?:%|percent|x|\+|k|m|million|thousand)?\b", lower))),
        "Readable resume length": (10, len(words)),
        "Parse-friendly text": (10, ("\n" in text and len(text) > 200)),
    }
    results = []
    # Give partial credit for common signals, while keeping the rubric visible to users.
    for label, (maximum, value) in sections.items():
        if label == "Contact details":
            earned = maximum if value else (8 if "@" in text or re.search(r"(?:\+?\d[\d ()-]{7,}\d)", text) else 0)
        elif label == "Core resume sections":
            earned = round(maximum * value / 3)
        elif label == "Relevant keywords":
            earned = min(maximum, round(maximum * value / 5))
        elif label == "Achievement evidence":
            earned = min(maximum, round(maximum * value / 4))
        elif label == "Readable resume length":
            earned = maximum if 250 <= value <= 1000 else (6 if 150 <= value <= 1400 else 2)
        else:
            earned = maximum if value else 3
        tips = {
            "Contact details": "Include a clearly formatted email address and phone number." if earned < maximum else "Email and phone details were found.",
            "Core resume sections": "Use standard headings such as Experience, Education, and Skills." if earned < maximum else "Standard experience, education, and skills headings were found.",
            "Relevant keywords": "Add role-specific skills and tools that match the jobs you are targeting." if earned < maximum else "Several common skills and tools were found; tailor these to each role.",
            "Achievement evidence": "Add measurable outcomes, such as percentages, revenue, time saved, or users reached." if earned < maximum else "Quantified results were found; make sure they describe your own impact.",
            "Readable resume length": "Keep the resume focused; a useful starting range is about 250–1,000 extracted words." if earned < maximum else "The extracted text is within a common readable range.",
            "Parse-friendly text": "Use selectable text and simple section structure; avoid relying on images or complex layouts." if earned < maximum else "Text and line breaks were extracted for analysis.",
        }
        results.append({"category": label, "score": earned, "max_score": maximum, "feedback": tips[label]})
    return {"score": sum(item["score"] for item in results), "max_score": 100, "label": "Heuristic ATS readiness estimate", "breakdown": results}


def analyze_resume(resume_text: str) -> str:
    prompt = f"""
You are an expert technical recruiter and resume reviewer.

Analyze the candidate's resume and provide a structured professional assessment.

Cover these areas:

1. Resume Summary
2. Key Strengths
3. Technical Skills
4. Missing or Weak Skills
5. Experience and Project Quality
6. ATS Optimization
7. Resume Improvement Suggestions
8. Suitable Job Roles
9. Overall Recommendations

Use only information present in the resume.
Do not invent experience, skills, certifications, achievements, or education.

Candidate Resume:
----------------
{resume_text}
----------------

Provide a clear and practical analysis that the candidate can use to improve their resume and career prospects.
"""

    return ai_service.generate_text(prompt)
