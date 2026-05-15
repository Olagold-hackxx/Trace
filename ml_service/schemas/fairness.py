"""
Output schema for the fairness audit.

Dataclasses are the source of truth — `run_audit` serialises with
`dataclasses.asdict`. Pydantic models here mirror them so the
/admin/fairness route can validate and serve the JSON.
"""
from __future__ import annotations

import dataclasses
from dataclasses import dataclass, field
from typing import Optional

from pydantic import BaseModel


# ── Dataclasses (written by the audit, serialised to JSON) ──────────────────

@dataclass
class MetricCI:
    point: float
    ci_low: float
    ci_high: float


@dataclass
class GroupReport:
    group: str
    n: int
    base_rate: float
    selection_rate: MetricCI
    tpr: MetricCI
    fpr: MetricCI
    brier: MetricCI


@dataclass
class AttributeReport:
    attribute: str
    groups: list[GroupReport]
    demographic_parity_difference: MetricCI
    equalized_odds_difference: MetricCI
    max_calibration_gap: MetricCI
    flags: list[str]


@dataclass
class OverallMetrics:
    roc_auc: float
    brier: float
    approval_rate: float
    default_rate: float
    n_test: int


@dataclass
class IntersectionalCell:
    group_a: str
    group_b: str
    n: int
    approval_rate: MetricCI
    tpr: MetricCI
    low_n: bool


@dataclass
class IntersectionalReport:
    attr_a: str
    attr_b: str
    note: str
    groups: list[IntersectionalCell]


@dataclass
class ProxyFeature:
    feature: str
    protected_attr: str
    association: float
    method: str       # "cramers_v" | "eta_squared" | "point_biserial"
    strength: str     # "weak" | "moderate" | "strong"
    flagged: bool


@dataclass
class FairnessReport:
    generated_at: str
    model_version: str
    approval_pd_cutoff: float
    overall: Optional[OverallMetrics]
    by_attribute: list[AttributeReport]
    intersectional: list[IntersectionalReport]
    proxy_analysis: list[ProxyFeature]
    calibration_plots: dict[str, str]
    flags_summary: list[str]


# ── Pydantic mirrors (used by the FastAPI route) ─────────────────────────────

class MetricCIModel(BaseModel):
    point: float
    ci_low: float
    ci_high: float


class GroupReportModel(BaseModel):
    group: str
    n: int
    base_rate: float
    selection_rate: MetricCIModel
    tpr: MetricCIModel
    fpr: MetricCIModel
    brier: MetricCIModel


class AttributeReportModel(BaseModel):
    attribute: str
    groups: list[GroupReportModel]
    demographic_parity_difference: MetricCIModel
    equalized_odds_difference: MetricCIModel
    max_calibration_gap: MetricCIModel
    flags: list[str]


class OverallMetricsModel(BaseModel):
    roc_auc: float
    brier: float
    approval_rate: float
    default_rate: float
    n_test: int


class IntersectionalCellModel(BaseModel):
    group_a: str
    group_b: str
    n: int
    approval_rate: MetricCIModel
    tpr: MetricCIModel
    low_n: bool


class IntersectionalReportModel(BaseModel):
    attr_a: str
    attr_b: str
    note: str
    groups: list[IntersectionalCellModel]


class ProxyFeatureModel(BaseModel):
    feature: str
    protected_attr: str
    association: float
    method: str
    strength: str
    flagged: bool


class FairnessReportModel(BaseModel):
    generated_at: str
    model_version: str
    approval_pd_cutoff: float
    overall: Optional[OverallMetricsModel]
    by_attribute: list[AttributeReportModel]
    intersectional: list[IntersectionalReportModel]
    proxy_analysis: list[ProxyFeatureModel]
    calibration_plots: dict[str, str]
    flags_summary: list[str]
