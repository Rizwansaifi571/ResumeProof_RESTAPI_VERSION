import difflib

def check_language_alignment(repo: dict, required_skills: list) -> dict:
    """
    Checks if the languages and topics of a repository align with a list of required skills.
    Returns a dict with alignment boolean and list of matched skills.
    """
    matched = []
    repo_langs = [l.lower() for l in repo.get("languages", []) if l]
    if repo.get("language"):
        repo_langs.append(repo["language"].lower())
    
    repo_topics = [t.lower() for t in repo.get("topics", []) if t]
    
    for skill in required_skills:
        skill_lower = skill.lower()
        
        # Direct check
        if skill_lower in repo_langs or skill_lower in repo_topics:
            matched.append(skill)
            continue
            
        # Substring/partial checks (e.g. "reactjs" containing "react", "postgresql" containing "postgres")
        found_in_langs = False
        for lang in repo_langs:
            if skill_lower in lang or lang in skill_lower:
                matched.append(skill)
                found_in_langs = True
                break
        
        if not found_in_langs:
            for topic in repo_topics:
                if skill_lower in topic or topic in skill_lower:
                    matched.append(skill)
                    break
                    
    return {
        "aligned": len(matched) > 0,
        "matched_skills": list(set(matched))
    }

def match_projects_to_repos(claimed_projects: list, repos: list) -> list:
    """
    Matches a list of claimed projects from the resume against a list of fetched repositories
    using difflib fuzzy name alignment.
    claimed_projects format: [{'name': '...', 'technologies': [...]}]
    """
    matches = []
    
    for proj in claimed_projects:
        proj_name = proj.get("name", "")
        proj_techs = proj.get("technologies", [])
        
        best_match = None
        best_score = 0.0
        
        for repo in repos:
            repo_name = repo.get("name", "")
            
            # Fuzzy match ratio
            ratio = difflib.SequenceMatcher(None, proj_name.lower(), repo_name.lower()).ratio()
            
            # Substring heuristic
            sub_ratio = 0.0
            if proj_name.lower() in repo_name.lower() or repo_name.lower() in proj_name.lower():
                sub_ratio = min(len(proj_name), len(repo_name)) / max(len(proj_name), len(repo_name))
                sub_ratio = max(0.5, sub_ratio)
                
            score = max(ratio, sub_ratio)
            
            if score > best_score:
                best_score = score
                best_match = repo
                
        # Screenplay threshold is 0.4
        if best_match and best_score >= 0.4:
            alignment = check_language_alignment(best_match, proj_techs)
            matches.append({
                "claimed_project": proj_name,
                "matched_repo": best_match.get("name"),
                "score": round(best_score, 2),
                "alignment": alignment
            })
        else:
            matches.append({
                "claimed_project": proj_name,
                "matched_repo": None,
                "score": 0.0,
                "alignment": {"aligned": False, "matched_skills": []}
            })
            
    return matches
