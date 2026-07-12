from datetime import datetime, timezone
from github import GithubException, Github
import httpx
from app.utils.github_client import get_authenticated_github_client
from app.utils.logger import get_logger
from app.config import settings

logger = get_logger("github_analyzer")

def verify_github_user_exists(username: str) -> dict:
    g = get_authenticated_github_client()
    try:
        user = g.get_user(username)
        _ = user.login 
        created_at = user.created_at
        account_age_days = (datetime.now(timezone.utc) - created_at.replace(tzinfo=timezone.utc)).days
        return {
            "exists": True,
            "username": user.login,
            "name": user.name,
            "created_at": created_at.isoformat(),
            "public_repos": user.public_repos,
            "followers": user.followers,
            "account_age_days": account_age_days
        }
    except GithubException as e:
        if e.status == 404:
            return {"exists": False}
        logger.error(f"GitHub API error verifying user {username}: {e}")
        raise e

def get_pinned_repos(username: str) -> list:
    token = settings.github_token
    if not token or token == "dummy_token_for_now" or token.startswith("dummy"):
        return []
        
    query = """
    query($login: String!) {
      user(login: $login) {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              primaryLanguage {
                name
              }
              stargazerCount
              forkCount
            }
          }
        }
      }
    }
    """
    try:
        resp = httpx.post(
            "https://api.github.com/graphql",
            json={"query": query, "variables": {"login": username}},
            headers={"Authorization": f"Bearer {token}"},
            timeout=10.0
        )
        if resp.status_code == 200:
            data = resp.json()
            nodes = data.get("data", {}).get("user", {}).get("pinnedItems", {}).get("nodes", [])
            return nodes
    except Exception as e:
        logger.warning(f"Failed to fetch pinned repos for {username}: {e}")
    return []

def fetch_raw_github_data(username: str) -> dict:
    """
    Fetches comprehensive data for analyze_github_quality and ai_analysis nodes.
    """
    g = get_authenticated_github_client()
    try:
        user = g.get_user(username)
        created_at = user.created_at
        account_age_days = (datetime.now(timezone.utc) - created_at.replace(tzinfo=timezone.utc)).days
        
        repos_data = []
        total_commits = 0
        all_languages = {}
        
        # Limit to 50 for speed
        repos = user.get_repos(type="owner", sort="pushed", direction="desc")
        count = 0
        for r in repos:
            if count >= 50:
                break
            count += 1
            
            repo_info = {
                "name": r.name,
                "full_name": r.full_name,
                "description": r.description,
                "stars": r.stargazers_count,
                "forks": r.forks_count,
                "is_fork": r.fork,
                "created_at": r.created_at.isoformat(),
                "updated_at": r.updated_at.isoformat(),
                "default_branch": r.default_branch,
                "topics": [],
                "languages": {},
                "commit_count": 0
            }
            
            try:
                repo_info["topics"] = r.get_topics()
            except Exception:
                pass
                
            try:
                # Get language byte counts
                langs = r.get_languages()
                repo_info["languages"] = langs
                for lang, bytes_cnt in langs.items():
                    all_languages[lang] = all_languages.get(lang, 0) + bytes_cnt
            except Exception:
                pass
                
            # Get commit count for user
            try:
                commits = r.get_commits(author=username)
                c_count = 0
                for _ in commits[:30]:  # Limit to 30 to avoid excessive API calls
                    c_count += 1
                repo_info["commit_count"] = c_count
                total_commits += c_count
            except Exception:
                pass
                
            repos_data.append(repo_info)
            
        pinned = get_pinned_repos(username)
        
        # Get recent events for recency/consistency
        recent_events = []
        try:
            events = user.get_events()
            e_count = 0
            for e in events:
                if e_count >= 30:
                    break
                if e.type == "PushEvent":
                    recent_events.append(e.created_at.isoformat())
                e_count += 1
        except Exception:
            pass

        return {
            "username": user.login,
            "account_age_days": account_age_days,
            "followers": user.followers,
            "public_repos": user.public_repos,
            "public_gists": user.public_gists if hasattr(user, 'public_gists') else 0,
            "total_commits": total_commits,
            "repos": repos_data,
            "pinned_repos": pinned,
            "all_languages": all_languages,
            "recent_events": recent_events,
            "qualitySignals": {} # To be filled by quality node
        }
    except GithubException as e:
        logger.error(f"GitHub API error fetching raw data for user {username}: {e}")
        raise e
