import json
from app.analyzers.ai_analyzer import get_groq_client, clean_json_response
from app.utils.logger import get_logger

logger = get_logger("resume_extractor")

def extract_resume_claims_node(state: dict) -> dict:
    """
    Node: Extract structured claims from the resume text using Groq.
    """
    resume_text = state.get("resume_text", "")
    if not resume_text:
        return {"resume_claims": {
            "claimed_github_username": None,
            "claimed_projects": [],
            "claimed_skills": [],
            "claimed_experience_years": None,
            "education": []
        }}

    logger.info("Extracting resume claims...")
    client = get_groq_client()
    
    prompt = f"""
    You are an expert technical resume parser.
    Extract the following structured information from the candidate's resume text.
    
    Resume Text:
    {resume_text}
    
    Return ONLY a JSON object with this exact shape:
    {{
      "claimed_github_username": "string or null",
      "claimed_projects": [{{ "name": "string", "tech_stack": ["string"] }}],
      "claimed_skills": ["string"],
      "claimed_experience_years": 0,
      "education": [{{ "degree": "string", "institution": "string" }}]
    }}
    
    For claimed_experience_years, use a number or null.
    Do not include any explanation, markdown formatting (outside of json code blocks), or extra text.
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a precise JSON extractor that only outputs raw JSON objects."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.0
        )
        response_text = chat_completion.choices[0].message.content
        cleaned = clean_json_response(response_text)
        claims = json.loads(cleaned)
        
        # Check for GitHub username mismatch
        flags = state.get("flags", [])
        claimed_username = claims.get("claimed_github_username")
        actual_username = state.get("github_url", "").rstrip("/").split("/")[-1]
        
        if claimed_username and actual_username:
            if claimed_username.lower() != actual_username.lower():
                flags.append("GITHUB_USERNAME_MISMATCH")
                
        return {
            "resume_claims": claims,
            "flags": flags
        }
    except Exception as e:
        logger.error(f"Error extracting resume claims: {e}")
        return {"resume_claims": {
            "claimed_github_username": None,
            "claimed_projects": [],
            "claimed_skills": [],
            "claimed_experience_years": None,
            "education": []
        }}
