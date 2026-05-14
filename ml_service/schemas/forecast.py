from datetime import date
from typing import Optional

from pydantic import BaseModel


class DailyForecast(BaseModel):
    date: date
    predicted_inflow_kobo: int
    lower_bound_kobo: int
    upper_bound_kobo: int


class DipWarning(BaseModel):
    dip_start_date: date
    dip_end_date: date
    severity: str
    expected_gap_kobo: int
    suggested_loan_kobo: int


class ForecastResponse(BaseModel):
    user_id: str
    model_version: str
    daily: list[DailyForecast]
    dip_warning: Optional[DipWarning]
