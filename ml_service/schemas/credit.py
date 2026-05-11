from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Transaction(BaseModel):
    sender_id: str
    amount: float
    occurred_at: datetime
    direction: str  # 'in' or 'out'

class ScoreRequest(BaseModel):
    user_id: str
    features: dict[str, float | int | str | None]
    transactions: Optional[List[Transaction]] = None  # for fraud detection

class SubScores(BaseModel):
    cash_flow_stability: int = Field(ge=0, le=100)
    customer_base: int = Field(ge=0, le=100)
    growth: int = Field(ge=0, le=100)
    reliability: int = Field(ge=0, le=100)

class ScoreResponse(BaseModel):
    user_id: str
    score: int = Field(ge=300, le=850)
    pd: float = Field(ge=0.0, le=1.0)
    sub_scores: SubScores
    model_version: str
    computed_at: str
    
class ExplainRequest(BaseModel):
    user_id: str
    features: dict[str, float | int | str | None]

class FactorExplanation(BaseModel):
    feature: str
    value: str
    phrasing: str
    score_delta: int

class ExplainResponse(BaseModel):
    user_id: str
    score: int
    pd: float
    helping: list[FactorExplanation]
    hurting: list[FactorExplanation]
    model_version: str