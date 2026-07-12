from github import Github
from app.config import settings

_github_client = None

def get_authenticated_github_client() -> Github:
    """
    Returns a singleton PyGithub client authenticated via GITHUB_TOKEN,
    falling back to unauthenticated if token is empty or dummy.
    """
    global _github_client
    if _github_client is None:
        token = settings.github_token
        if not token or token == "dummy_token_for_now" or token.startswith("dummy"):
            _github_client = Github()
        else:
            _github_client = Github(token)
    return _github_client
