import httpx
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger("webhook_dispatcher")

def dispatch_webhook_to_client(transaction_id: str, client_id: str, result: dict):
   
    github = result.get("github", {})
    result_data = {
        "confidenceScore": result.get("confidenceScore"),
        "status": result.get("status"),
        "githubUsername": github.get("username"),
        "reposFound": github.get("reposFound"),
        "claimedProjects": github.get("claimedProjects"),
        "verifiedProjects": github.get("verifiedProjects"),
        "commitAuthorship": github.get("commitAuthorship"),
        "skillAlignment": result.get("skillAlignment"),
        "matchedSkills": result.get("matchedSkills", []),
        "missingSkills": result.get("missingSkills", []),
        "flags": result.get("flags", []),
        "rawGithubData": None,
        "aiAnalysis": None
    }
    
    payload = {
        "transactionId": transaction_id,
        "clientId": client_id,
        "resultData": result_data
    }
    
    url = f"{settings.ms1_internal_url}/internal/result"
    headers = {
        "Content-Type": "application/json",
        "X-Internal-Secret": settings.internal_secret
    }
    
    logger.info(f"Forwarding verification result to MS1 internal endpoint: {url}...")
    try:
        response = httpx.post(url, json=payload, headers=headers, timeout=10.0)
        if response.status_code != 200:
            logger.error(f"MS1 rejected internal result submission with status {response.status_code}: {response.text}")
            raise RuntimeError(f"MS1 internal result handoff failed: {response.text}")
        logger.info(f"Successfully handed off result to MS1 for transaction {transaction_id}")
    except Exception as e:
        logger.error(f"Failed to submit result to MS1 internal endpoint: {e}")
        raise e
