from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ScoreRequest(BaseModel):
    user_id: str
    as_of: Optional[datetime] = None  # defaults to now; use for point-in-time scoring


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
    as_of: Optional[datetime] = None


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


class FraudRequest(BaseModel):
    transaction_id: str
    user_id: str


class FraudResponse(BaseModel):
    transaction_id: str
    user_id: str
    fraud_penalty: float
    anomaly_score: float
    is_anomalous: bool
