from datetime import datetime, timezone
from app.utils.logger import get_logger
from app.utils.github_client import get_authenticated_github_client

logger = get_logger("github_quality")

def analyze_github_quality_node(state: dict) -> dict:
    """
    Computes a structured quality profile from the GitHub data and appends it to state["rawGithubData"]["qualitySignals"].
    """
    raw_data = state.get("rawGithubData")
    if not raw_data:
        logger.error("No rawGithubData found in state.")
        return {"flags": state.get("flags", [])}
        
    flags = state.get("flags", [])
    today = datetime.now(timezone.utc)
    
    # 1. Account Authenticity Score
    account_age_days = raw_data.get("account_age_days", 0)
    followers = raw_data.get("followers", 0)
    total_commits = raw_data.get("total_commits", 0)
    repos = raw_data.get("repos", [])
    public_gists = raw_data.get("public_gists", 0)
    
    fork_count = sum(1 for r in repos if r.get("is_fork"))
    total_repos = len(repos)
    original_repos = total_repos - fork_count
    
    authenticity_score = 0
    if account_age_days >= 365: authenticity_score += 25
    elif account_age_days >= 180: authenticity_score += 15
    elif account_age_days >= 90: authenticity_score += 5
    
    if followers >= 10: authenticity_score += 15
    elif followers >= 3: authenticity_score += 8
    
    if total_commits >= 500: authenticity_score += 25
    elif total_commits >= 100: authenticity_score += 15
    elif total_commits >= 30: authenticity_score += 5
    
    if original_repos >= 10: authenticity_score += 20
    elif original_repos >= 5: authenticity_score += 12
    elif original_repos >= 2: authenticity_score += 5
    
    if public_gists >= 3: authenticity_score += 15
    elif public_gists >= 1: authenticity_score += 8
    
    authenticity_score = min(authenticity_score, 100)
    
    # 2. Fork vs Original Ratio
    fork_ratio = fork_count / max(total_repos, 1)
    
    # 3. README Quality Score
    g = get_authenticated_github_client()
    username = raw_data.get("username")
    
    # Sort non-fork repos by stars + commits
    original_repo_list = [r for r in repos if not r.get("is_fork")]
    top_10 = sorted(original_repo_list, key=lambda x: x.get("stars", 0) + x.get("commit_count", 0), reverse=True)[:10]
    
    repos_with_good_readme = 0
    for r in top_10:
        readme_length = 0
        try:
            repo_obj = g.get_repo(r["full_name"])
            readme = repo_obj.get_readme()
            readme_length = len(readme.decoded_content)
        except Exception:
            pass
            
        if readme_length > 1000:
            repos_with_good_readme += 1
            
    readme_coverage = repos_with_good_readme / max(len(top_10), 1)
    
    # 4. Commit Recency
    recent_events = raw_data.get("recent_events", [])
    if recent_events:
        most_recent_str = recent_events[0]
        # handle Z ending
        most_recent_str = most_recent_str.replace("Z", "+00:00")
        try:
            most_recent = datetime.fromisoformat(most_recent_str)
            last_commit_days_ago = (today - most_recent).days
        except Exception:
            last_commit_days_ago = 9999
            
        months = set()
        for ev in recent_events:
            ev_str = ev.replace("Z", "+00:00")
            try:
                dt = datetime.fromisoformat(ev_str)
                months.add(f"{dt.year}-{dt.month}")
            except Exception:
                pass
        active_months = len(months)
    else:
        last_commit_days_ago = 9999
        active_months = 0
        
    # 5. Language Depth
    all_langs = raw_data.get("all_languages", {})
    sorted_langs = sorted(all_langs.items(), key=lambda x: x[1], reverse=True)
    
    primary_language = sorted_langs[0][0] if sorted_langs else None
    
    languages_by_depth = []
    for lang, bytes_cnt in sorted_langs[:8]:
        # Count how many repos use this language
        repo_cnt = sum(1 for r in repos if lang in r.get("languages", {}))
        languages_by_depth.append({
            "language": lang,
            "totalBytes": bytes_cnt,
            "repoCount": repo_cnt
        })
        
    # 6. Contribution Consistency
    weeks = set()
    for ev in recent_events:
        ev_str = ev.replace("Z", "+00:00")
        try:
            dt = datetime.fromisoformat(ev_str)
            # get ISO calendar (year, week, weekday)
            year, week, _ = dt.isocalendar()
            weeks.add(f"{year}-{week}")
        except Exception:
            pass
    
    consistent_weeks = len(weeks)
    if consistent_weeks >= 20: contribution_pattern = "consistent"
    elif consistent_weeks >= 8: contribution_pattern = "moderate"
    else: contribution_pattern = "sporadic"
    
    # Populate qualitySignals
    quality = {
        "accountAuthenticityScore": authenticity_score,
        "forkRatio": round(fork_ratio, 2),
        "forkCount": fork_count,
        "originalCount": original_repos,
        "readmeCoverage": round(readme_coverage, 2),
        "reposWithGoodReadme": repos_with_good_readme,
        "lastCommitDaysAgo": last_commit_days_ago,
        "activeMonthsInLastYear": active_months,
        "contributionPattern": contribution_pattern,
        "consistentWeeksLast6Months": consistent_weeks,
        "primaryLanguage": primary_language,
        "languagesByDepth": languages_by_depth
    }
    
    raw_data["qualitySignals"] = quality
    
    return {
        "rawGithubData": raw_data,
        "flags": flags
    }
