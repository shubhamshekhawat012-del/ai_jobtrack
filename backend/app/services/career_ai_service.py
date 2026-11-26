from .ai_service import ai_service



def generate_career_advice(
    career_goal: str,
    current_skills: str,
    experience_level: str,
    interests: str | None,
) -> str:

    prompt = f"""
You are an expert technology career advisor.

Analyze the candidate's current profile
and career goal.

Provide practical and personalized career advice.

Use exactly these sections:

1. Career Assessment

2. Skill Gap

3. Recommended Technologies

4. Project Recommendations

5. Career Roadmap

6. Next Steps

Do not give generic advice.
Make the recommendations relevant to the
candidate's current skills and target role.

CAREER GOAL:
{career_goal}

CURRENT SKILLS:
{current_skills}

EXPERIENCE LEVEL:
{experience_level}

INTERESTS:
{interests or "Not specified"}
"""

    return ai_service.generate_text(prompt)



def generate_learning_roadmap(
    career_goal: str,
    current_skills: str,
    experience_level: str,
    available_hours_per_week: int,
    target_months: int,
) -> str:

    prompt = f"""
You are an expert technology learning-roadmap designer.

Create a realistic and personalized learning roadmap
for the candidate.

The roadmap must consider:

- Career goal
- Current skills
- Experience level
- Available study hours
- Target duration

Do not create an unrealistic roadmap.

Use this structure:

1. Goal

Clearly explain the target role and what the learner
needs to become job-ready.

2. Current Skill Assessment

Analyze the candidate's current skills.

3. Month-by-Month Roadmap

For every month provide:

- Topics to learn
- Technologies/tools
- Practical exercises
- Project work
- Expected outcome

4. Project Plan

Suggest practical projects that should be built.

5. Interview Preparation

List technical and behavioral topics to prepare.

6. Final Outcome

Explain what the candidate should be capable of
after completing the roadmap.

CAREER GOAL:
{career_goal}

CURRENT SKILLS:
{current_skills}

EXPERIENCE LEVEL:
{experience_level}

AVAILABLE HOURS PER WEEK:
{available_hours_per_week}

TARGET DURATION:
{target_months} months
"""

    return ai_service.generate_text(prompt)