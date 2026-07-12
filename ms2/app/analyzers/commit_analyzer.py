from datetime import datetime, timezone
from github import GithubException
from app.utils.github_client import get_authenticated_github_client
from app.utils.logger import get_logger

logger = get_logger("commit_analyzer")

def detect_suspicious_commit_patterns(commit_dates: list) -> list:
    """
    Analyzes a list of datetime objects (sorted or unsorted) for automated or unnatural commit behavior.
    """
    if not commit_dates:
        return []
        
    # Sort chronologically
    dates = sorted(commit_dates)
    patterns = []
    
    # 1. All commits on a single calendar day (bulk import check)
    unique_days = {d.date() for d in dates}
    if len(dates) >= 5 and len(unique_days) == 1:
        patterns.append("all_commits_single_day")
        
    # 2. Compressed burst: more than 10 commits in under 3 days (scripted history check)
    if len(dates) >= 10:
        span_days = (dates[-1] - dates[0]).days
        if span_days <= 3:
            patterns.append("compressed_burst")
            
    # 3. Single clock hour check (all commits within the same clock hour)
    unique_hours = {d.hour for d in dates}
    if len(dates) >= 5 and len(unique_hours) == 1:
        patterns.append("single_clock_hour")
        
    # 4. Perfectly uniform spacing (difference between consecutive commits is identical)
    if len(dates) >= 5:
        diffs = [(dates[i] - dates[i-1]).total_seconds() for i in range(1, len(dates))]
        if len(set(diffs)) == 1:
            patterns.append("perfectly_uniform_spacing")
            
    return patterns

def check_commit_authorship(repo, username: str) -> dict:
    """
    Checks if a user has contributed commits to a repo and analyzes commit patterns.
    repo can be full repo name (e.g. 'owner/repo') or a PyGithub Repository object.
    """
    g = get_authenticated_github_client()
    try:
        if isinstance(repo, str):
            repo_obj = g.get_repo(repo)
        else:
            repo_obj = repo
            
        commits = repo_obj.get_commits(author=username)
        
        # Pull up to 200 commits
        commit_dates = []
        count = 0
        for c in commits:
            if count >= 200:
                break
            if c.commit and c.commit.author and c.commit.author.date:
                # Ensure tz-aware datetimes
                commit_dates.append(c.commit.author.date.replace(tzinfo=timezone.utc))
                count += 1
                
        commit_dates.sort()
        
        is_author = len(commit_dates) > 0
        first_commit = commit_dates[0].isoformat() if is_author else None
        last_commit = commit_dates[-1].isoformat() if is_author else None
        date_range_days = (commit_dates[-1] - commit_dates[0]).days if len(commit_dates) > 1 else 0
        
        patterns = detect_suspicious_commit_patterns(commit_dates)
        
        return {
            "is_author": is_author,
            "authored_commits": len(commit_dates),
            "first_commit": first_commit,
            "last_commit": last_commit,
            "date_range_days": date_range_days,
            "suspicious_patterns": patterns
        }
    except GithubException as e:
        logger.error(f"GitHub API error checking commits for {username} in {repo}: {e}")
        return {
            "is_author": False,
            "authored_commits": 0,
            "first_commit": None,
            "last_commit": None,
            "date_range_days": 0,
            "suspicious_patterns": []
        }
