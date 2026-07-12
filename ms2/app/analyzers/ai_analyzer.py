import json
import re
from groq import Groq
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger("ai_analyzer")

_groq_call_count = 0

def get_groq_client():
    return Groq(api_key=settings.groq_api_key)

def clean_json_response(text: str) -> str:
    text = text.strip()
    match = re.search(r'```json\s*([\s\S]*?)\s*```', text)
    if match:
        return match.group(1).strip()
    match_plain = re.search(r'```\s*([\s\S]*?)\s*```', text)
    if match_plain:
        return match_plain.group(1).strip()
    return text

def perform_ai_verification(resume_claims: dict, raw_github_data: dict) -> dict:
    """
    Performs AI verification using Groq llama3-70b-8192 based on GitHub data and Resume claims.
    Returns structured JSON object.
    """
    global _groq_call_count
    _groq_call_count += 1
    logger.info(f"Groq API Call Count: {_groq_call_count}")

    client = get_groq_client()
    
    # Extract needed info from raw_github_data
    github_username = raw_github_data.get("username", "")
    repos_found = raw_github_data.get("public_repos", 0)
    account_age = raw_github_data.get("account_age_days", 0)
    total_commits = raw_github_data.get("total_commits", 0)
    pinned_repos = raw_github_data.get("pinned_repos", [])
    
    # Top 10 repos by stars/commits
    original_repos = [r for r in raw_github_data.get("repos", []) if not r.get("is_fork")]
    top_10 = sorted(original_repos, key=lambda x: x.get("stars", 0) + x.get("commit_count", 0), reverse=True)[:10]
    top_10_formatted = []
    for r in top_10:
        top_10_formatted.append({
            "name": r.get("name"),
            "description": r.get("description"),
            "languages": list(r.get("languages", {}).keys()),
            "commit_count": r.get("commit_count")
        })
        
    quality = raw_github_data.get("qualitySignals", {})
    languages_by_depth = quality.get("languagesByDepth", [])
    langs_formatted = [f"Lang: {l['language']} {l['totalBytes']/1024:.1f}k bytes across {l['repoCount']} repos" for l in languages_by_depth[:5]]
    
    prompt = f"""
You are a technical resume verification engine. You receive a candidate's resume claims and their actual GitHub profile data. Your job is to determine how truthful and accurate the resume is.

RESUME CLAIMS:
{json.dumps(resume_claims, indent=2) if resume_claims else "{}"}

GITHUB DATA:
- Username: {github_username}
- Public repos: {repos_found}, Account age: {account_age} days
- Top repos: {json.dumps(top_10_formatted, indent=2)}
- Pinned repos: {json.dumps(pinned_repos, indent=2)}
- Total commits: {total_commits}

GITHUB QUALITY SIGNALS:
- Account age: {account_age} days
- Contribution pattern: {quality.get("contributionPattern", "unknown")} ({quality.get("consistentWeeksLast6Months", 0)} active weeks in last 6 months)
- Last commit: {quality.get("lastCommitDaysAgo", 9999)} days ago
- Original repos: {quality.get("originalCount", 0)} / Forks: {quality.get("forkCount", 0)} (fork ratio: {quality.get("forkRatio", 0.0)})
- Primary language by code volume: {quality.get("primaryLanguage", "none")}
- Language depth: {', '.join(langs_formatted)}
- README coverage: {quality.get("readmeCoverage", 0.0)*100}% of original repos have substantive READMEs
- Account authenticity score: {quality.get("accountAuthenticityScore", 0)}/100

This gives you enough signal to reason about whether the GitHub profile looks like a real developer vs a resume-padding account.

CRITICAL INSTRUCTIONS:
1. Many professional developers work on private company repositories. Do NOT flag a profile as "suspicious" or "fabricated", or issue red flags, solely because their claimed professional projects cannot be found in their public GitHub data. Assess their authenticity based on the code they do have.
2. For `commitsByCandidate`, use the `commit_count` provided in the Top repos data. If a project is not found, set it to 0, but do not issue a red flag for it if it appears to be a private company project.

Return ONLY a JSON object with this exact shape:
{{
  "projectMatches": [
    {{
      "claimedProject": "string",
      "matchedRepo": "string or null",
      "matchConfidence": number (0-100),
      "commitsByCandidate": number,
      "techOverlap": ["string"],
      "verdict": "verified" | "partial" | "not_found"
    }}
  ],
  "skillVerification": {{
    "verifiedSkills": ["string"],
    "unverifiedSkills": ["string"],
    "missingFromGithub": ["string"]
  }},
  "redFlags": ["string"],
  "overallVerdict": "authentic" | "mostly_authentic" | "suspicious" | "fabricated",
  "summary": "string (2-3 sentences, professional tone)"
}}

Do not output anything else.
"""
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a precise JSON extractor that only outputs raw JSON objects."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.0
        )
        response_text = chat_completion.choices[0].message.content
        cleaned = clean_json_response(response_text)
        return json.loads(cleaned)
    except Exception as e:
        logger.error(f"Error analyzing profile with AI: {e}")
        return {
            "projectMatches": [],
            "skillVerification": {
                "verifiedSkills": [],
                "unverifiedSkills": [],
                "missingFromGithub": []
            },
            "redFlags": ["AI_ANALYSIS_FAILED"],
            "overallVerdict": "suspicious",
            "summary": "AI alignment analysis failed due to an error."
        }

def get_call_count() -> int:
    return _groq_call_count
