import uuid
import psycopg2
from psycopg2.extras import Json
from psycopg2.pool import SimpleConnectionPool
from contextlib import contextmanager
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger("db_service")

# Initialize Connection Pool
try:
    # Remove ?schema=public or other query params since psycopg2 doesn't support them
    db_url = settings.database_url.split('?')[0]
    db_pool = SimpleConnectionPool(
        minconn=1,
        maxconn=10,
        dsn=db_url
    )
    logger.info("Database connection pool initialized.")
except Exception as e:
    logger.error(f"Failed to initialize database connection pool: {e}")
    raise e

@contextmanager
def get_db_connection():
    conn = db_pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        db_pool.putconn(conn)

def write_verification_result(transaction_id: str, result: dict) -> str:
    """
    Inserts a verification result into the results table.
    Supports upsert on transactionId conflict.
    result dict uses the flat shape: { confidenceScore, status, githubUsername, ... }
    """
    result_id = str(uuid.uuid4())

    score = result.get("confidenceScore")
    status = result.get("status")
    username = result.get("githubUsername")
    repos_found = result.get("reposFound")
    claimed_projects = result.get("claimedProjects")
    verified_projects = result.get("verifiedProjects")
    commit_authorship = result.get("commitAuthorship")
    skill_alignment = result.get("skillAlignment")

    matched_skills = Json(result.get("matchedSkills", []))
    missing_skills = Json(result.get("missingSkills", []))
    flags = Json(result.get("flags", []))

    sql = """
    INSERT INTO results (
        id, "transactionId", "confidenceScore", status, "githubUsername", 
        "reposFound", "claimedProjects", "verifiedProjects", "commitAuthorship", 
        "skillAlignment", "matchedSkills", "missingSkills", flags, "createdAt"
    ) VALUES (
        %s, %s, %s, %s, %s, 
        %s, %s, %s, %s, 
        %s, %s, %s, %s, NOW()
    )
    ON CONFLICT ("transactionId") DO UPDATE SET
        "confidenceScore" = EXCLUDED."confidenceScore",
        status = EXCLUDED.status,
        "githubUsername" = EXCLUDED."githubUsername",
        "reposFound" = EXCLUDED."reposFound",
        "claimedProjects" = EXCLUDED."claimedProjects",
        "verifiedProjects" = EXCLUDED."verifiedProjects",
        "commitAuthorship" = EXCLUDED."commitAuthorship",
        "skillAlignment" = EXCLUDED."skillAlignment",
        "matchedSkills" = EXCLUDED."matchedSkills",
        "missingSkills" = EXCLUDED."missingSkills",
        flags = EXCLUDED.flags
    """

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (
                result_id, transaction_id, score, status, username,
                repos_found, claimed_projects, verified_projects, commit_authorship,
                skill_alignment, matched_skills, missing_skills, flags
            ))

    logger.info(f"Result row written/updated for transaction {transaction_id}")
    return result_id


def update_transaction_status(transaction_id: str, status: str, completed: bool = False):
    """
    Updates the status and completedAt of a transaction.
    """
    if completed:
        sql = """
        UPDATE transactions 
        SET status = %s, "completedAt" = NOW() 
        WHERE id = %s
        """
    else:
        sql = """
        UPDATE transactions 
        SET status = %s 
        WHERE id = %s
        """
        
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (status, transaction_id))
            
    logger.info(f"Transaction {transaction_id} status updated to {status}")

def update_job_record(transaction_id: str, status: str, error_message: str = None, active: bool = False):
    """
    Updates the job execution state, logging timestamps and failure messages if present.
    """
    if active:
        sql = """
        UPDATE jobs 
        SET status = %s, attempts = attempts + 1, "startedAt" = NOW()
        WHERE "transactionId" = %s
        """
        params = (status, transaction_id)
    elif error_message:
        sql = """
        UPDATE jobs 
        SET status = %s, "errorMessage" = %s, "finishedAt" = NOW()
        WHERE "transactionId" = %s
        """
        params = (status, error_message, transaction_id)
    else:
        sql = """
        UPDATE jobs 
        SET status = %s, "finishedAt" = NOW()
        WHERE "transactionId" = %s
        """
        params = (status, transaction_id)
        
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            
    logger.info(f"Job for transaction {transaction_id} status updated to {status}")

def get_transaction_details(transaction_id: str) -> dict:
    """
    Fetches the details needed for verification from the transaction row.
    """
    sql = """
    SELECT "githubUrl", "resumeText", "clientId" 
    FROM transactions 
    WHERE id = %s
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (transaction_id,))
            row = cur.fetchone()
            if row:
                return {
                    "githubUrl": row[0],
                    "resumeText": row[1],
                    "clientId": row[2]
                }
            return {}
