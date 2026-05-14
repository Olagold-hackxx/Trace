from pydantic import BaseModel, Field
from typing import Optional, List


class MatchRequest(BaseModel):
    job_id: str
    top_k: int = Field(default=5, ge=1, le=20)


class WorkerResult(BaseModel):
    worker_id: str
    name: str
    primary_category: str
    location_name: str
    distance_km: float
    daily_rate_naira: int
    completed_gigs: int
    kudiscore_tier: Optional[str]
    bvn_verified: bool
    semantic_score: float
    location_score: float
    performance_score: float
    rate_score: float
    final_score: float


class MatchResponse(BaseModel):
    job_id: str
    job_title: str
    job_location: str
    budget_naira: int
    top_workers: List[WorkerResult]
    model_version: str
    computed_at: str
