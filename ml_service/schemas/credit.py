from pydantic import BaseModel, Field
from typing import Optional, List
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
    helping: List[FactorExplanation]
    hurting: List[FactorExplanation]
    model_version: str


class FraudRequest(BaseModel):
    """
    Score one specific transaction for fraud.

    The backend passes the transaction details inline rather than a transaction_id
    so the ML service can compute features without needing a separate DB lookup.
    The ML service fetches the user's 30-day history from the DB using user_id + occurred_at.
    """
    transaction_id: str
    user_id: str
    occurred_at: datetime
    amount_kobo: int = Field(ge=1)
    sender_name: str
    type: str = Field(default="inflow", pattern="^(inflow|outflow)$")


class FraudResponse(BaseModel):
    transaction_id: str
    user_id: str
    anomaly_score: float = Field(ge=0.0, le=1.0)
    is_anomalous: bool
    top_signals: List[str]   # top-3 feature names driving the anomaly score
    fraud_penalty: float     # 0-100 score points to subtract from KudiScore
