from app.utils.logger import get_logger

logger = get_logger("score_calculator")

def compute_confidence_score(
    raw_github_data: dict,
    resume_claims: dict,
    ai_analysis: dict,
    existing_flags: list
) -> dict:
    """
    Computes final confidence score, status, and flags based on the deterministic rules.
    """
    logger.info("Computing deterministic confidence score...")
    
    base_score = 0
    flags = list(existing_flags)
    
    repos_found = raw_github_data.get("public_repos", 0)
    total_commits = raw_github_data.get("total_commits", 0)
    account_age_days = raw_github_data.get("account_age_days", 0)
    quality = raw_github_data.get("qualitySignals", {})
    
    # 1. GitHub account legitimacy (20 pts)
    if repos_found >= 5: base_score += 5
    if repos_found >= 15: base_score += 5
    if total_commits >= 100: base_score += 5
    if account_age_days >= 180: base_score += 5
        
    # Variables extracted from AI output
    claimed_projects_list = resume_claims.get("claimed_projects", [])
    claimed_projects_count = len(claimed_projects_list)
    project_matches = ai_analysis.get("projectMatches", [])
    
    verified_projects_count = sum(1 for p in project_matches if p.get("verdict") == "verified")
    
    commit_authorship = any(p.get("commitsByCandidate", 0) > 0 for p in project_matches)
    if not commit_authorship and total_commits > 0:
        commit_authorship = True
        
    # 2. Project verification (35 pts)
    if claimed_projects_count > 0:
        verification_rate = verified_projects_count / claimed_projects_count
        base_score += int(verification_rate * 35)
        if verified_projects_count == 0 and total_commits >= 50:
            base_score += 15
    else:
        # No projects claimed — neutral
        base_score += 15
        
    # 3. Commit authorship (15 pts)
    if commit_authorship:
        base_score += 15
        
    # 4. Skill alignment (20 pts)
    claimed_skills = set(resume_claims.get("claimed_skills", []))
    github_langs = set(raw_github_data.get("all_languages", {}).keys())
    ai_verified_skills = set(ai_analysis.get("skillVerification", {}).get("verifiedSkills", []))
    
    skill_alignment = 0
    if claimed_skills:
        overlap_count = len([
            s for s in claimed_skills 
            if any(l.lower() == s.lower() for l in github_langs) or 
               any(v.lower() == s.lower() for v in ai_verified_skills)
        ])
        overlap = min(1.0, overlap_count / len(claimed_skills))
        skill_alignment = int(overlap * 100)
        base_score += int(overlap * 20)
        
    # 5. GitHub quality bonus (10 pts)
    quality_bonus = 0
    if quality.get("accountAuthenticityScore", 0) >= 70: quality_bonus += 5
    if quality.get("contributionPattern") == "consistent": quality_bonus += 3
    if quality.get("readmeCoverage", 0.0) >= 0.5: quality_bonus += 2
    base_score += quality_bonus
    
    confidence_score = min(base_score, 100)
    
    # Status
    if confidence_score >= 75: status = "verified"
    elif confidence_score >= 50: status = "flagged"
    else: status = "rejected"
    
    # Auto-flags
    if verified_projects_count == 0 and claimed_projects_count > 0 and total_commits < 10:
        flags.append("NO_PROJECTS_VERIFIED")
    if not commit_authorship and claimed_projects_count > 0:
        flags.append("NO_COMMIT_AUTHORSHIP")
    if claimed_skills and skill_alignment < 30:
        flags.append("LOW_SKILL_ALIGNMENT")
    if repos_found < 3:
        flags.append("SPARSE_GITHUB_PROFILE")
    if ai_analysis.get("overallVerdict") in ["suspicious", "fabricated"]:
        flags.append("AI_FLAGGED_SUSPICIOUS")
        
    if quality.get("forkRatio", 0.0) > 0.8 and repos_found > 5:
        flags.append("HIGH_FORK_RATIO")
    if quality.get("lastCommitDaysAgo", 0) > 365:
        flags.append("INACTIVE_PROFILE")
    if quality.get("accountAuthenticityScore", 100) < 30:
        flags.append("SUSPICIOUS_ACCOUNT_PATTERN")
        
    # Add any redFlags from aiAnalysis as-is
    ai_flags = ai_analysis.get("redFlags", [])
    if isinstance(ai_flags, list):
        flags.extend(ai_flags)
        
    # Remove duplicates
    flags = list(dict.fromkeys(flags))
    
    return {
        "confidence_score": confidence_score,
        "status": status,
        "flags": flags,
        "claimed_projects_count": claimed_projects_count,
        "verified_projects_count": verified_projects_count,
        "commit_authorship": commit_authorship,
        "skill_alignment": skill_alignment
    }
