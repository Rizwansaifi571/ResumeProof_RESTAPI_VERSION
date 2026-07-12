import os
import sys

# Add project root directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.analyzers.github_analyzer import verify_github_user_exists, fetch_public_repos, analyze_account_health
from app.analyzers.project_matcher import match_projects_to_repos
from app.analyzers.commit_analyzer import check_commit_authorship

def run_tests():
    # 1. Test user existence
    print("--- 1. Testing user existence ---")
    real_user = "torvalds"
    fake_user = "this_user_does_not_exist_123456789_rp"
    
    print(f"Checking real user: {real_user}")
    real_res = verify_github_user_exists(real_user)
    print(f"Result (exists): {real_res.get('exists')}")
    print(f"Name: {real_res.get('name')}, Email: {real_res.get('email')}, Age (days): {real_res.get('account_age_days')}")
    
    print(f"\nChecking fake user: {fake_user}")
    fake_res = verify_github_user_exists(fake_user)
    print(f"Result (exists): {fake_res.get('exists')}")
    
    # 2. Test fetching public repos
    print("\n--- 2. Testing repository fetch ---")
    # Using a smaller, known account to avoid rate limits / long lists
    target_user = "google" 
    print(f"Fetching public repos for '{target_user}'...")
    repos = fetch_public_repos(target_user)
    print(f"Fetched {len(repos)} repositories (excluding forks).")
    if repos:
        first = repos[0]
        print(f"First repo name: {first['name']}")
        print(f"First repo languages: {first['languages']}")
        print(f"First repo size: {first['size_kb']} KB")
        print(f"First repo pushed_at: {first['pushed_at']}")
        
    # 3. Test fuzzy matching projects to repos
    print("\n--- 3. Testing fuzzy matching of projects ---")
    claimed = [
        {"name": "resume-proof", "technologies": ["TypeScript", "Next.js"]},
        {"name": "nonexistent-project", "technologies": ["Rust"]}
    ]
    # Fake repos list to test fuzzy match
    mock_repos = [
        {"name": "ResumeProof-API", "languages": ["TypeScript"], "topics": ["nodejs", "express"]},
        {"name": "another-repo", "languages": ["Go"], "topics": []}
    ]
    print(f"Matching claimed projects against mock repos...")
    matches = match_projects_to_repos(claimed, mock_repos)
    for m in matches:
        print(f"Claimed Project: '{m['claimed_project']}' matched to Repo: '{m['matched_repo']}' with score: {m['score']}")
        print(f"  Alignment matching details: {m['alignment']}")

    # 4. Test account health and rate limit parsing
    print("\n--- 4. Testing account health and rate limit information ---")
    health = analyze_account_health(real_user)
    print(f"Health score for '{real_user}': {health.get('health_score')}")
    print(f"Flags: {health.get('flags')}")
    print(f"GitHub Rate Limit Remaining: {health.get('rate_limit_remaining')} / {health.get('rate_limit_limit')}")
    print(f"Rate Limit Reset Time: {health.get('rate_limit_reset')}")

if __name__ == "__main__":
    run_tests()
