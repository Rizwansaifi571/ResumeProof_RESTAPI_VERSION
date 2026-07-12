from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI
from app.workers import job_consumer
from app.utils.logger import get_logger

logger = get_logger("main")

# Keep a reference to background tasks to prevent garbage collection
background_tasks = set()

def start_background_worker():
    logger.info("Launching job consumer background task...")
    task = asyncio.create_task(job_consumer.start_consumer())
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)
    return task

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    start_background_worker()
    yield
    # Shutdown
    logger.info("Shutting down background workers...")
    for task in list(background_tasks):
        task.cancel()
    if background_tasks:
        await asyncio.gather(*background_tasks, return_exceptions=True)
    logger.info("Shutdown complete.")

def create_app() -> FastAPI:
    app = FastAPI(
        title="ResumeProof Verification Service (MS2)",
        version="1.0.0",
        lifespan=lifespan
    )

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app
