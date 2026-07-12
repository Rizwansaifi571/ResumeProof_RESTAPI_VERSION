from typing import TypedDict, List, Dict, Any, Optional
import json
import httpx
from langgraph.graph import StateGraph, END
from app.config import settings

from app.analyzers.resume_extractor import extract_resume_claims_node
from app.analyzers.github_analyzer import fetch_raw_github_data, verify_github_user_exists
from app.analyzers.github_quality import analyze_github_quality_node
from app.analyzers.ai_analyzer import perform_ai_verification
from app.analyzers.score_calculator import compute_confidence_score
from app.utils.logger import get_logger

logger = get_logger("verification_orchestrator")

class AgentState(TypedDict):
    transaction_id: str
    github_url: str
    resume_text: str
    jd_text: str
    client_id: str
    
    resume_claims: Dict[str, Any]
    github_user_exists: bool
    rawGithubData: Dict[str, Any]
    aiAnalysis: Dict[str, Any]
    
    claimed_projects_count: int
    verified_projects_count: int
    commit_authorship: bool
    skill_alignment: int
    
    confidence_score: int
    status: str
    flags: List[str]
    error: Optional[str]
    
    final_result: Dict[str, Any]


def node_extract_resume(state: AgentState) -> Dict[str, Any]:
    try:
        res = extract_resume_claims_node(state)
        return res
    except Exception as e:
        logger.error(f"Error in extract_resume: {e}")
        return {"error": str(e)}

def node_fetch_github(state: AgentState) -> Dict[str, Any]:
    try:
        github_url = state.get("github_url", "")
        username = github_url.rstrip("/").split("/")[-1]
        
        user_check = verify_github_user_exists(username)
        if not user_check.get("exists"):
            logger.warn(f"GitHub user {username} does not exist.")
            flags = state.get("flags", [])
            flags.append("github_user_not_found")
            return {
                "github_user_exists": False,
                "rawGithubData": {},
                "flags": flags
            }
            
        raw_data = fetch_raw_github_data(username)
        return {
            "github_user_exists": True,
            "rawGithubData": raw_data
        }
    except Exception as e:
        logger.error(f"Error in fetch_github: {e}")
        return {"error": str(e)}

def node_analyze_quality(state: AgentState) -> Dict[str, Any]:
    try:
        if not state.get("github_user_exists"):
            return {}
        return analyze_github_quality_node(state)
    except Exception as e:
        logger.error(f"Error in analyze_quality: {e}")
        return {"error": str(e)}

def node_ai_analysis(state: AgentState) -> Dict[str, Any]:
    try:
        if not state.get("github_user_exists"):
            return {"aiAnalysis": {}}
        ai_res = perform_ai_verification(state.get("resume_claims", {}), state.get("rawGithubData", {}))
        return {"aiAnalysis": ai_res}
    except Exception as e:
        logger.error(f"Error in ai_analysis: {e}")
        return {"error": str(e)}

def node_score_calculation(state: AgentState) -> Dict[str, Any]:
    try:
        if not state.get("github_user_exists"):
            return {
                "confidence_score": 0,
                "status": "rejected"
            }
        score_res = compute_confidence_score(
            state.get("rawGithubData", {}),
            state.get("resume_claims", {}),
            state.get("aiAnalysis", {}),
            state.get("flags", [])
        )
        return score_res
    except Exception as e:
        logger.error(f"Error in score_calculation: {e}")
        return {"error": str(e)}

def node_build_final(state: AgentState) -> Dict[str, Any]:
    logger.info("Starting build_final_result node...")
    try:
        transaction_id = state.get("transaction_id")
        github_url_str = state.get("github_url") or ""
        username = github_url_str.rstrip("/").split("/")[-1]
        
        raw_github = state.get("rawGithubData", {})
        ai_analysis = state.get("aiAnalysis", {})
        
        matched_skills = []
        missing_skills = []
        if ai_analysis and "skillVerification" in ai_analysis:
            matched_skills = ai_analysis["skillVerification"].get("verifiedSkills", [])
            missing_skills = ai_analysis["skillVerification"].get("missingFromGithub", [])
            
        result_data = {
            "confidenceScore": state.get("confidence_score", 0),
            "status": state.get("status", "flagged"),
            "githubUsername": username,
            "reposFound": raw_github.get("public_repos", 0),
            "claimedProjects": state.get("claimed_projects_count", 0),
            "verifiedProjects": state.get("verified_projects_count", 0),
            "commitAuthorship": state.get("commit_authorship", False),
            "skillAlignment": state.get("skill_alignment", 0),
            "matchedSkills": matched_skills,
            "missingSkills": missing_skills,
            "flags": state.get("flags", []),
            "rawGithubData": raw_github if raw_github else None,
            "aiAnalysis": ai_analysis if ai_analysis else None
        }
        
        # ms1 Prisma schema stores rawGithubData and aiAnalysis as String? columns,
        # so we must serialize them to JSON strings in the wire payload.
        ms1_result_data = {
            **result_data,
            "rawGithubData": json.dumps(raw_github) if raw_github else None,
            "aiAnalysis": json.dumps(ai_analysis) if ai_analysis else None,
        }
        
        payload = {
            "transactionId": transaction_id,
            "clientId": state.get("client_id", ""),
            "resultData": ms1_result_data
        }
        
        # Write to local DB using the raw dict (not serialized strings)
        from app.services import db_service
        db_service.write_verification_result(transaction_id, result_data)
        db_service.update_transaction_status(transaction_id, result_data["status"], completed=True)
        db_service.update_job_record(transaction_id, "done")
        
        # Handoff to MS1
        url = f"{settings.ms1_internal_url}/internal/result"
        headers = {
            "Content-Type": "application/json",
            "X-Internal-Secret": settings.internal_secret
        }
        
        logger.info(f"POSTing final result to MS1 at {url}")
        resp = httpx.post(url, json=payload, headers=headers, timeout=10.0)
        if resp.status_code not in (200, 201, 202, 204):
            logger.error(f"MS1 rejected result with status {resp.status_code}: {resp.text}")
            # Spec: "If non-2xx, log error and still mark job complete"
            
        return {"final_result": result_data}
    except Exception as e:
        logger.error(f"Error in build_final: {e}")
        return {"error": str(e)}

def node_terminal_error(state: AgentState) -> Dict[str, Any]:
    """Terminal error node called when any previous node throws an exception"""
    logger.error(f"Terminal error node invoked. Error: {state.get('error')}")
    transaction_id = state.get("transaction_id")
    
    result_data = {
        "confidenceScore": 0,
        "status": "error",
        "flags": ["PIPELINE_ERROR"]
    }
    
    payload = {
        "transactionId": transaction_id,
        "clientId": state.get("client_id", ""),
        "resultData": result_data
    }
    
    try:
        url = f"{settings.ms1_internal_url}/internal/result"
        headers = {
            "Content-Type": "application/json",
            "X-Internal-Secret": settings.internal_secret
        }
        httpx.post(url, json=payload, headers=headers, timeout=10.0)
        
        from app.services import db_service
        db_service.update_transaction_status(transaction_id, "failed")
        db_service.update_job_record(transaction_id, "failed", error_message=state.get("error"))
    except Exception as fallback_e:
        logger.error(f"Failed to process terminal error fallback: {fallback_e}")
        
    return {"final_result": result_data}

# Build graph
workflow = StateGraph(AgentState)

workflow.add_node("extract_resume_claims", node_extract_resume)
workflow.add_node("fetch_github_data", node_fetch_github)
workflow.add_node("analyze_github_quality", node_analyze_quality)
workflow.add_node("ai_analysis", node_ai_analysis)
workflow.add_node("score_calculation", node_score_calculation)
workflow.add_node("build_final_result", node_build_final)
workflow.add_node("terminal_error", node_terminal_error)

workflow.set_entry_point("extract_resume_claims")

def router(state: AgentState, next_node: str) -> str:
    if state.get("error"):
        return "terminal_error"
    return next_node

workflow.add_conditional_edges("extract_resume_claims", lambda s: router(s, "fetch_github_data"))
workflow.add_conditional_edges("fetch_github_data", lambda s: router(s, "analyze_github_quality"))
workflow.add_conditional_edges("analyze_github_quality", lambda s: router(s, "ai_analysis"))
workflow.add_conditional_edges("ai_analysis", lambda s: router(s, "score_calculation"))
workflow.add_conditional_edges("score_calculation", lambda s: router(s, "build_final_result"))
workflow.add_conditional_edges("build_final_result", lambda s: router(s, END))
workflow.add_edge("terminal_error", END)

compiled_graph = workflow.compile()

def run_full_verification(job_data: dict) -> dict:
    logger.info(f"Invoking verification graph for Transaction ID: {job_data.get('transactionId')}")
    
    initial_state = {
        "transaction_id": job_data.get("transactionId"),
        "github_url": job_data.get("githubUrl"),
        "resume_text": job_data.get("resumeText", ""),
        "jd_text": job_data.get("jdText", ""),
        "client_id": job_data.get("clientId", ""),
        
        "resume_claims": {},
        "github_user_exists": False,
        "rawGithubData": {},
        "aiAnalysis": {},
        
        "claimed_projects_count": 0,
        "verified_projects_count": 0,
        "commit_authorship": False,
        "skill_alignment": 0,
        
        "confidence_score": 0,
        "status": "flagged",
        "flags": [],
        "error": None,
        "final_result": {}
    }
    
    try:
        from app.services import db_service
        db_service.update_job_record(job_data.get("transactionId"), "active", active=True)
        db_service.update_transaction_status(job_data.get("transactionId"), "processing")
        
        final_state = compiled_graph.invoke(initial_state)
        return final_state.get("final_result", {})
    except Exception as e:
        logger.error(f"Unhandled graph execution error: {e}")
        # Invoke terminal error manually if graph totally explodes
        node_terminal_error({"transaction_id": job_data.get("transactionId"), "error": str(e)})
        raise e
