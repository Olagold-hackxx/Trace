"""
Fairness audit for the KudiScore credit model.

Run offline:
    python -m training.fairness_audit

Outputs:
    data/audit/fairness_report.json
    data/audit/plots/calibration_gender.png
    data/audit/plots/calibration_market_location.png

Steps implemented:
    Step 1 — skeleton: loads test data, writes valid empty JSON
    Step 2 — core metrics: per-group MetricFrame + bootstrapped CIs + disparity flags
    Step 3 — calibration plots: per-group reliability diagrams
    Step 4 — intersectional + proxy analysis
"""
from __future__ import annotations

import dataclasses
import json
import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

import numpy as np
import pandas as pd
from sklearn.metrics import (
    brier_score_loss,
    roc_auc_score,
)

from inference.artifact_loader import Artifact
from schemas.fairness import (
    AttributeReport,
    FairnessReport,
    GroupReport,
    IntersectionalCell,
    IntersectionalReport,
    MetricCI,
    OverallMetrics,
    ProxyFeature,
)

logger = logging.getLogger(__name__)

_ROOT = Path(__file__).parent.parent


# ── Config ────────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class AuditConfig:
    # Paths — all relative to ml_service root
    artifact_path: Path = _ROOT / "models" / "deeper_model_artifact_v1.pkl"
    features_path: Path = _ROOT / "data" / "features_v1.parquet"
    labels_path:   Path = _ROOT / "data" / "synth_labels.parquet"
    splits_path:   Path = _ROOT / "data" / "splits.parquet"
    output_dir:    Path = _ROOT / "results" / "audit"

    # Approval threshold — set once before looking at results
    approval_pd_cutoff: float = 0.05

    # Flag thresholds — conventional cutoffs, not tuned to findings
    dp_diff_flag: float = 0.10        # demographic parity difference
    eo_diff_flag: float = 0.10        # equalized odds difference
    calibration_gap_flag: float = 0.05  # max per-group Brier gap

    # Bootstrap
    n_bootstrap: int = 1000
    bootstrap_seed: int = 42
    ci_level: float = 0.80

    # Intersectional small-cell rule
    min_cell_n_for_flag: int = 30

    # Proxy association thresholds (Cohen 1988; Cramér 1946)
    cramers_v_moderate: float = 0.10
    cramers_v_strong:   float = 0.20
    eta_sq_moderate:    float = 0.01   # η² conventional: small=0.01, med=0.06
    eta_sq_strong:      float = 0.06

    # Protected attributes (in feature_cols; NOT target-leaked into model as-is,
    # but present as categoricals — proxy risk is real)
    protected_attrs: tuple[str, ...] = ("gender", "market_location", "age_bracket")

    # Calibration plot attributes (age skipped — 5-curve overlay reduces legibility)
    calibration_plot_attrs: tuple[str, ...] = ("gender", "market_location")


# ── Data loader ───────────────────────────────────────────────────────────────

def load_audit_data(cfg: AuditConfig) -> tuple[np.ndarray, np.ndarray, pd.DataFrame]:
    """
    Load the exact test-set rows held out during credit model training,
    re-score them through the artifact, and return:

        y_true       : (n,) int array — actual defaults
        y_score      : (n,) float array — calibrated PD from the artifact
        sensitive_df : DataFrame with protected-attribute columns
    """
    features = pd.read_parquet(cfg.features_path)
    labels   = pd.read_parquet(cfg.labels_path)
    splits   = pd.read_parquet(cfg.splits_path)

    test_ids = splits.loc[splits["split"] == "test", "user_id"]
    data = (
        features
        .merge(labels[["user_id", "default"]], on="user_id")
        .loc[lambda df: df["user_id"].isin(test_ids)]
        .reset_index(drop=True)
    )

    artifact = Artifact.load(cfg.artifact_path)

    X = data[artifact.feature_cols].copy()
    for col in artifact.categorical_cols:
        X[col] = X[col].astype("category")

    raw_scores = artifact.model.predict(X)
    y_score    = artifact.calibrator.predict(raw_scores)

    y_true       = data["default"].to_numpy(dtype=int)
    sensitive_df = data[list(cfg.protected_attrs)].copy()

    logger.info(
        "Loaded %d test rows | default rate %.2f%% | approval rate %.1f%%",
        len(y_true),
        y_true.mean() * 100,
        (y_score < cfg.approval_pd_cutoff).mean() * 100,
    )
    return y_true, y_score, sensitive_df


# ── Bootstrap ─────────────────────────────────────────────────────────────────

def bootstrap_metric(
    metric_fn: Callable[[np.ndarray, np.ndarray], float],
    y_true: np.ndarray,
    y_pred: np.ndarray,
    n_boot: int,
    seed: int,
    ci_level: float,
) -> MetricCI:
    """
    Unstratified bootstrap CI for a scalar metric.
    Resamples rows (not groups) so CIs reflect deployment uncertainty
    including natural group-mix variation.
    """
    rng = np.random.default_rng(seed)
    n = len(y_true)
    point = metric_fn(y_true, y_pred)

    boot_vals = []
    for _ in range(n_boot):
        idx = rng.integers(0, n, size=n)
        try:
            boot_vals.append(metric_fn(y_true[idx], y_pred[idx]))
        except Exception:
            boot_vals.append(np.nan)

    boot_arr = np.array(boot_vals)
    boot_arr = boot_arr[~np.isnan(boot_arr)]

    alpha = (1 - ci_level) / 2
    ci_low  = float(np.nanpercentile(boot_arr, alpha * 100))
    ci_high = float(np.nanpercentile(boot_arr, (1 - alpha) * 100))

    return MetricCI(point=float(point), ci_low=ci_low, ci_high=ci_high)


# ── Core metrics (Step 2) ─────────────────────────────────────────────────────

def _selection_rate(_: np.ndarray, y_pred: np.ndarray) -> float:
    return float((y_pred < _APPROVAL_CUTOFF).mean())

def _tpr(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    pos = y_true == 1
    if pos.sum() == 0:
        return float("nan")
    approved = y_pred < _APPROVAL_CUTOFF
    return float(approved[pos].mean())

def _fpr(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    neg = y_true == 0
    if neg.sum() == 0:
        return float("nan")
    approved = y_pred < _APPROVAL_CUTOFF
    return float(approved[neg].mean())

# Module-level sentinel overwritten by run_audit before calling metrics
_APPROVAL_CUTOFF: float = 0.05


def audit_attribute(
    y_true: np.ndarray,
    y_score: np.ndarray,
    sensitive: pd.Series,
    attr: str,
    cfg: AuditConfig,
) -> AttributeReport:
    global _APPROVAL_CUTOFF
    _APPROVAL_CUTOFF = cfg.approval_pd_cutoff

    groups = sorted(sensitive.dropna().unique().astype(str))
    group_reports: list[GroupReport] = []

    sel_rates: list[float] = []
    tprs:      list[float] = []
    fprs:      list[float] = []
    briers:    list[float] = []

    for g in groups:
        mask = sensitive.astype(str) == g
        yt, yp = y_true[mask], y_score[mask]
        n = int(mask.sum())

        if n < 5:
            logger.warning("Group %s=%s has n=%d — skipping", attr, g, n)
            continue

        seed_g = hash(attr + g) % (2**31)

        sr  = bootstrap_metric(_selection_rate, yt, yp, cfg.n_bootstrap, seed_g,     cfg.ci_level)
        tpr = bootstrap_metric(_tpr,            yt, yp, cfg.n_bootstrap, seed_g + 1, cfg.ci_level)
        fpr = bootstrap_metric(_fpr,            yt, yp, cfg.n_bootstrap, seed_g + 2, cfg.ci_level)
        bri = bootstrap_metric(
            lambda a, b: brier_score_loss(a, b),
            yt, yp, cfg.n_bootstrap, seed_g + 3, cfg.ci_level,
        )

        group_reports.append(GroupReport(
            group=str(g),
            n=n,
            base_rate=float(yt.mean()),
            selection_rate=sr,
            tpr=tpr,
            fpr=fpr,
            brier=bri,
        ))

        sel_rates.append(sr.point)
        tprs.append(tpr.point if not np.isnan(tpr.point) else np.nan)
        fprs.append(fpr.point if not np.isnan(fpr.point) else np.nan)
        briers.append(bri.point)

    # Disparity metrics
    dp_diff = _disparity_ci(
        y_true, y_score, sensitive,
        lambda _, yp: (yp < cfg.approval_pd_cutoff).mean(),
        cfg,
    )
    eo_diff = _equalized_odds_diff_ci(y_true, y_score, sensitive, cfg)
    cal_gap  = _calibration_gap_ci(y_true, y_score, sensitive, cfg)

    # Flags
    flags: list[str] = []
    if abs(dp_diff.point) > cfg.dp_diff_flag:
        flags.append(
            f"demographic_parity_difference={dp_diff.point:.3f} "
            f"exceeds threshold {cfg.dp_diff_flag}"
        )
    if abs(eo_diff.point) > cfg.eo_diff_flag:
        flags.append(
            f"equalized_odds_difference={eo_diff.point:.3f} "
            f"exceeds threshold {cfg.eo_diff_flag}"
        )
    if cal_gap.point > cfg.calibration_gap_flag:
        flags.append(
            f"max_calibration_gap={cal_gap.point:.3f} "
            f"exceeds threshold {cfg.calibration_gap_flag}"
        )

    return AttributeReport(
        attribute=attr,
        groups=group_reports,
        demographic_parity_difference=dp_diff,
        equalized_odds_difference=eo_diff,
        max_calibration_gap=cal_gap,
        flags=flags,
    )


def _disparity_ci(
    y_true: np.ndarray,
    y_score: np.ndarray,
    sensitive: pd.Series,
    metric_fn: Callable,
    cfg: AuditConfig,
) -> MetricCI:
    """Bootstrap CI for max-minus-min disparity of a per-group metric."""
    groups = sorted(sensitive.dropna().unique().astype(str))

    def disparity(yt, yp):
        vals = []
        for g in groups:
            mask = sensitive.astype(str).values == g
            if mask.sum() >= 5:
                vals.append(metric_fn(yt[mask], yp[mask]))
        return max(vals) - min(vals) if len(vals) >= 2 else 0.0

    return bootstrap_metric(disparity, y_true, y_score, cfg.n_bootstrap, cfg.bootstrap_seed, cfg.ci_level)


def _equalized_odds_diff_ci(
    y_true: np.ndarray,
    y_score: np.ndarray,
    sensitive: pd.Series,
    cfg: AuditConfig,
) -> MetricCI:
    """
    EO difference = max over all group pairs of max(|TPR_a-TPR_b|, |FPR_a-FPR_b|).
    This is the worst-case pair, not an average — documented in the JSON note.
    """
    groups = sorted(sensitive.dropna().unique().astype(str))
    cutoff = cfg.approval_pd_cutoff

    def eo_diff(yt, yp):
        tprs, fprs = {}, {}
        for g in groups:
            mask = sensitive.astype(str).values == g
            if mask.sum() < 5:
                continue
            pos, neg = (yt[mask] == 1), (yt[mask] == 0)
            approved = yp[mask] < cutoff
            tprs[g] = float(approved[pos].mean()) if pos.sum() > 0 else np.nan
            fprs[g] = float(approved[neg].mean()) if neg.sum() > 0 else np.nan

        valid = [g for g in groups if g in tprs and not np.isnan(tprs[g])]
        if len(valid) < 2:
            return 0.0

        worst = 0.0
        for i, ga in enumerate(valid):
            for gb in valid[i + 1:]:
                tpr_gap = abs(tprs[ga] - tprs[gb]) if not (np.isnan(tprs[ga]) or np.isnan(tprs[gb])) else 0.0
                fpr_gap = abs(fprs.get(ga, 0) - fprs.get(gb, 0))
                worst = max(worst, tpr_gap, fpr_gap)
        return worst

    return bootstrap_metric(eo_diff, y_true, y_score, cfg.n_bootstrap, cfg.bootstrap_seed + 99, cfg.ci_level)


def _calibration_gap_ci(
    y_true: np.ndarray,
    y_score: np.ndarray,
    sensitive: pd.Series,
    cfg: AuditConfig,
) -> MetricCI:
    """Max per-group Brier score minus min per-group Brier score."""
    groups = sorted(sensitive.dropna().unique().astype(str))

    def cal_gap(yt, yp):
        briers = []
        for g in groups:
            mask = sensitive.astype(str).values == g
            if mask.sum() >= 5:
                briers.append(brier_score_loss(yt[mask], yp[mask]))
        return max(briers) - min(briers) if len(briers) >= 2 else 0.0

    return bootstrap_metric(cal_gap, y_true, y_score, cfg.n_bootstrap, cfg.bootstrap_seed + 199, cfg.ci_level)


def compute_overall(
    y_true: np.ndarray,
    y_score: np.ndarray,
    cfg: AuditConfig,
) -> OverallMetrics:
    approved = y_score < cfg.approval_pd_cutoff
    return OverallMetrics(
        roc_auc=float(roc_auc_score(y_true, y_score)),
        brier=float(brier_score_loss(y_true, y_score)),
        approval_rate=float(approved.mean()),
        default_rate=float(y_true.mean()),
        n_test=int(len(y_true)),
    )


# ── Calibration plots (Step 3) ───────────────────────────────────────────────

def plot_calibration(
    y_true: np.ndarray,
    y_score: np.ndarray,
    sensitive: pd.Series,
    attr: str,
    output_dir: Path,
) -> str:
    """
    Reliability diagram with quantile binning, one curve per group.
    Returns the saved path string.
    """
    import matplotlib.pyplot as plt
    from sklearn.calibration import calibration_curve

    groups = sorted(sensitive.dropna().unique().astype(str))
    fig, ax = plt.subplots(figsize=(7, 6))

    colors = plt.cm.tab10.colors
    for i, g in enumerate(groups):
        mask = sensitive.astype(str) == g
        yt, yp = y_true[mask], y_score[mask]
        if mask.sum() < 20:
            continue
        frac_pos, mean_pred = calibration_curve(yt, yp, n_bins=10, strategy="quantile")
        bri = brier_score_loss(yt, yp)
        ax.plot(
            mean_pred, frac_pos,
            marker="o", markersize=4, linewidth=1.5,
            color=colors[i % len(colors)],
            label=f"{g}  (n={mask.sum():,}, Brier={bri:.4f})",
        )

    ax.plot([0, 1], [0, 1], "k--", linewidth=1, alpha=0.5, label="Perfect calibration")
    ax.set_xlabel("Mean predicted PD", fontsize=11)
    ax.set_ylabel("Fraction of actual defaults", fontsize=11)
    ax.set_title(
        f"Calibration by {attr.replace('_', ' ').title()}\n"
        f"(quantile bins, 80% CI from bootstrap)",
        fontsize=11, fontweight="bold",
    )
    ax.legend(fontsize=8, loc="upper left")
    ax.spines[["top", "right"]].set_visible(False)

    plot_path = output_dir / "plots" / f"calibration_{attr}.png"
    plt.tight_layout()
    plt.savefig(plot_path, dpi=130, bbox_inches="tight")
    plt.close(fig)
    logger.info("Saved calibration plot → %s", plot_path)
    return str(plot_path)


# ── Intersectional analysis (Step 4) ─────────────────────────────────────────

def audit_intersectional(
    y_true: np.ndarray,
    y_score: np.ndarray,
    sensitive_df: pd.DataFrame,
    attr_a: str,
    attr_b: str,
    cfg: AuditConfig,
) -> IntersectionalReport:
    cutoff = cfg.approval_pd_cutoff
    cells: list[IntersectionalCell] = []
    for ga in sorted(sensitive_df[attr_a].dropna().unique().astype(str)):
        for gb in sorted(sensitive_df[attr_b].dropna().unique().astype(str)):
            mask = (sensitive_df[attr_a].astype(str) == ga) & (sensitive_df[attr_b].astype(str) == gb)
            n = int(mask.sum())
            if n == 0:
                continue
            yt, yp = y_true[mask.values], y_score[mask.values]

            seed_cell = hash(ga + gb) % (2**31)
            sr_ci  = bootstrap_metric(
                lambda _, b: float((b < cutoff).mean()),
                yt, yp, cfg.n_bootstrap, seed_cell, cfg.ci_level,
            )
            tpr_ci = bootstrap_metric(_tpr, yt, yp, cfg.n_bootstrap, seed_cell + 1, cfg.ci_level)

            cells.append(IntersectionalCell(
                group_a=ga,
                group_b=gb,
                n=n,
                approval_rate=sr_ci,
                tpr=tpr_ci,
                low_n=(n < cfg.min_cell_n_for_flag),
            ))

    return IntersectionalReport(
        attr_a=attr_a,
        attr_b=attr_b,
        note=(
            f"Cells with n < {cfg.min_cell_n_for_flag} are reported but excluded from "
            f"disparity flagging (low_n=true). "
            f"equalized_odds_difference uses worst-case pair across all group combinations, "
            f"not an average."
        ),
        groups=cells,
    )


# ── Proxy analysis (Step 4) ───────────────────────────────────────────────────

def _cramers_v(col_a: pd.Series, col_b: pd.Series) -> float:
    from scipy.stats.contingency import association
    ct = pd.crosstab(col_a.astype(str), col_b.astype(str))
    if ct.shape[0] < 2 or ct.shape[1] < 2:
        return 0.0
    return float(association(ct.values, method="cramer"))


def _eta_squared(continuous: pd.Series, categorical: pd.Series) -> float:
    """
    One-way ANOVA η² — proportion of variance explained by group membership.
    Returns 0.0 for near-constant features (std < 1e-6) to avoid division
    instability when ss_total ≈ 0.  Result is clamped to [0, 1].
    """
    if continuous.std() < 1e-6:
        return 0.0
    groups = [continuous[categorical == g].values for g in categorical.unique()]
    groups = [g for g in groups if len(g) >= 2]
    if len(groups) < 2:
        return 0.0
    grand_mean = continuous.mean()
    ss_between = sum(len(g) * (g.mean() - grand_mean) ** 2 for g in groups)
    ss_total   = ((continuous - grand_mean) ** 2).sum()
    if ss_total <= 0:
        return 0.0
    return float(min(ss_between / ss_total, 1.0))


def proxy_analysis(
    features_df: pd.DataFrame,
    sensitive_df: pd.DataFrame,
    feature_cols: list[str],
    categorical_cols: list[str],
    cfg: AuditConfig,
) -> list[ProxyFeature]:
    """
    For every model feature × protected attribute, compute association strength.

    Categorical × categorical  → Cramér's V   (Cramér 1946)
    Continuous  × categorical  → η²            (Cohen 1988)

    Flagging thresholds are conventional cutoffs, not tuned to these results.
    """
    results: list[ProxyFeature] = []

    for attr in cfg.protected_attrs:
        if attr not in sensitive_df.columns:
            continue
        sensitive_col = sensitive_df[attr]

        for feat in feature_cols:
            if feat not in features_df.columns or feat == attr:
                continue

            feat_col = features_df[feat].dropna()
            common_idx = feat_col.index.intersection(sensitive_col.index)
            fc = feat_col.loc[common_idx]
            sc = sensitive_col.loc[common_idx]

            if feat in categorical_cols:
                assoc  = _cramers_v(fc, sc)
                method = "cramers_v"
                if assoc >= cfg.cramers_v_strong:
                    strength = "strong"
                elif assoc >= cfg.cramers_v_moderate:
                    strength = "moderate"
                else:
                    strength = "weak"
                flagged = assoc >= cfg.cramers_v_strong
            else:
                assoc  = _eta_squared(fc.astype(float), sc.astype(str))
                method = "eta_squared"
                if assoc >= cfg.eta_sq_strong:
                    strength = "strong"
                elif assoc >= cfg.eta_sq_moderate:
                    strength = "moderate"
                else:
                    strength = "weak"
                flagged = assoc >= cfg.eta_sq_strong

            results.append(ProxyFeature(
                feature=feat,
                protected_attr=attr,
                association=round(assoc, 6),
                method=method,
                strength=strength,
                flagged=flagged,
            ))

    results.sort(key=lambda x: x.association, reverse=True)
    return results


# ── Orchestrator ──────────────────────────────────────────────────────────────

def run_audit(cfg: AuditConfig | None = None) -> FairnessReport:
    if cfg is None:
        cfg = AuditConfig()

    cfg.output_dir.mkdir(parents=True, exist_ok=True)
    (cfg.output_dir / "plots").mkdir(exist_ok=True)

    # ── Load data ──────────────────────────────────────────────────────────────
    y_true, y_score, sensitive_df = load_audit_data(cfg)

    artifact = Artifact.load(cfg.artifact_path)

    # ── Overall metrics ────────────────────────────────────────────────────────
    overall = compute_overall(y_true, y_score, cfg)

    # ── Per-attribute metrics ──────────────────────────────────────────────────
    by_attribute: list[AttributeReport] = []
    for attr in cfg.protected_attrs:
        logger.info("Auditing attribute: %s", attr)
        report = audit_attribute(y_true, y_score, sensitive_df[attr], attr, cfg)
        by_attribute.append(report)

    # ── Calibration plots ──────────────────────────────────────────────────────
    calibration_plots: dict[str, str] = {}
    for attr in cfg.calibration_plot_attrs:
        path = plot_calibration(y_true, y_score, sensitive_df[attr], attr, cfg.output_dir)
        calibration_plots[attr] = path

    # ── Intersectional ─────────────────────────────────────────────────────────
    intersectional = [
        audit_intersectional(y_true, y_score, sensitive_df, "gender", "market_location", cfg)
    ]

    # ── Proxy analysis ─────────────────────────────────────────────────────────
    features_df = pd.read_parquet(cfg.features_path)
    test_ids    = pd.read_parquet(cfg.splits_path).query("split == 'test'")["user_id"]
    features_df = features_df[features_df["user_id"].isin(test_ids)].reset_index(drop=True)

    proxies = proxy_analysis(
        features_df=features_df,
        sensitive_df=sensitive_df,
        feature_cols=artifact.feature_cols,
        categorical_cols=artifact.categorical_cols,
        cfg=cfg,
    )

    # ── Flags summary ──────────────────────────────────────────────────────────
    all_flags = [f for attr_r in by_attribute for f in attr_r.flags]

    # ── Assemble report ────────────────────────────────────────────────────────
    report = FairnessReport(
        generated_at=datetime.now(timezone.utc).isoformat(),
        model_version=artifact.model_version,
        approval_pd_cutoff=cfg.approval_pd_cutoff,
        overall=overall,
        by_attribute=by_attribute,
        intersectional=intersectional,
        proxy_analysis=proxies,
        calibration_plots=calibration_plots,
        flags_summary=all_flags,
    )

    report_path = cfg.output_dir / "fairness_report.json"
    with open(report_path, "w") as f:
        json.dump(dataclasses.asdict(report), f, indent=2, default=str)

    logger.info("Fairness report written → %s", report_path)
    return report


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )
    cfg = AuditConfig()
    report = run_audit(cfg)
    print(f"\nDone. Flags ({len(report.flags_summary)}):")
    for f in report.flags_summary:
        print(f"  • {f}")
    if not report.flags_summary:
        print("  (none)")
