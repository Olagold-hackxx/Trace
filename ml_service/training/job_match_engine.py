"""
Two-stage job matching engine for the Trace prototype.

Stage 1 — LaBSE bi-encoder + cosine similarity (numpy, in-memory, ~5ms for 200 workers)
Stage 2 — Heuristic weighted reranker (transparent, explainable, no training needed)

Production path (architecture slide):
  LaBSE → pgvector HNSW → LightGBM LambdaRank trained on real match-outcome data.
  We skip LambdaRank here because training a reranker on synthetic labels then
  evaluating on more synthetic labels is a closed loop that proves nothing.
"""

from __future__ import annotations

import math
import pickle
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer


# ─── Haversine ────────────────────────────────────────────────────────────────

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1 - a)))


def _haversine_vec(lat1: float, lon1: float,
                   lats2: np.ndarray, lons2: np.ndarray) -> np.ndarray:
    """Vectorised haversine — ~50× faster than a Python loop over iterrows."""
    R = 6371.0
    phi1  = math.radians(lat1)
    phis2 = np.radians(lats2)
    dphi  = np.radians(lats2 - lat1)
    dlam  = np.radians(lons2 - lon1)
    a = np.sin(dphi / 2) ** 2 + np.cos(phi1) * np.cos(phis2) * np.sin(dlam / 2) ** 2
    return R * 2 * np.arctan2(np.sqrt(a), np.sqrt(np.maximum(0.0, 1 - a)))


# ─── Reranker weights ─────────────────────────────────────────────────────────

WEIGHTS = {
    'semantic':    0.50,
    'location':    0.20,
    'performance': 0.15,
    'rate':        0.15,
}


class JobMatchEngine:
    """
    Two-stage job matching engine.

    Usage:
        engine = JobMatchEngine()
        engine.load_workers(workers_df, cache_path='models/worker_embeddings.npy')
        results = engine.match(job, top_k=5)
    """

    def __init__(self, model_name: str = 'sentence-transformers/LaBSE') -> None:
        print(f"Loading {model_name}...")
        self.model = SentenceTransformer(model_name)
        self.workers_df: Optional[pd.DataFrame] = None
        self._embeddings: Optional[np.ndarray] = None  # (N, D), L2-normalised

    # ── Text builders ──────────────────────────────────────────────────────────

    @staticmethod
    def _worker_text(row: pd.Series) -> str:
        skills = row['skills'] if isinstance(row['skills'], list) else row['skills'].split(', ')
        sec    = row.get('secondary_categories') or []
        sec_str = f" Also experienced in: {', '.join(sec)}." if sec else ''
        return (
            f"{row['bio']} "
            f"Skills: {', '.join(skills)}. "
            f"Category: {row['primary_category']}.{sec_str} "
            f"Location: {row['location_name']}."
        )

    @staticmethod
    def _job_text(job: dict) -> str:
        # Category anchor on the job side — symmetric with worker text.
        # Drops empty "Skills needed:" clause that polluted every embedding.
        parts = [f"{job['title']}.", job['description'],
                 f"Category: {job['category']}.", f"Location: {job['location_name']}."]
        return " ".join(parts)

    # ── Worker loading + embedding cache ──────────────────────────────────────

    def load_workers(self,
                     workers_df: pd.DataFrame,
                     cache_path: Optional[str] = None) -> None:
        """
        Embed all workers and store the L2-normalised matrix.
        cache_path uses .npy format — fast and safe (no pickle exec risk).
        """
        self.workers_df = workers_df.reset_index(drop=True)

        if cache_path and Path(cache_path).exists():
            print(f"Loading cached embeddings from {cache_path}")
            self._embeddings = np.load(cache_path)
            print(f"Loaded {self._embeddings.shape[0]} worker embeddings.")
            return

        texts = [self._worker_text(row) for _, row in workers_df.iterrows()]
        print(f"Encoding {len(texts)} worker profiles with LaBSE...")
        raw = self.model.encode(texts, batch_size=32, show_progress_bar=True,
                                convert_to_numpy=True)
        self._embeddings = self._l2_normalise(raw)

        if cache_path:
            Path(cache_path).parent.mkdir(parents=True, exist_ok=True)
            np.save(cache_path, self._embeddings)
            print(f"Embeddings cached to {cache_path}")

    # ── Stage 1: cosine retrieval ──────────────────────────────────────────────

    def retrieve(self, job: dict, top_k: int = 50) -> pd.DataFrame:
        """
        Return top_k candidates by cosine similarity.

        semantic_score is kept PURE (no radius penalty baked in).
        Service radius is applied only as a ranking signal for candidate selection,
        so it doesn't double-count with location_score in Stage 2.
        """
        self._require_workers()

        job_emb    = self._l2_normalise(
            self.model.encode([self._job_text(job)], convert_to_numpy=True)
        )[0]
        raw_scores = self._embeddings @ job_emb   # (N,) pure cosine, never mutated

        # Compute distances once — reused both for radius filter and rerank
        job_lat = job['location_lat']
        job_lng = job['location_lng']
        dists = _haversine_vec(
            job_lat, job_lng,
            self.workers_df['location_lat'].to_numpy(),
            self.workers_df['location_lng'].to_numpy(),
        )

        # Soft radius penalty — only for selecting candidates, not stored as semantic_score
        ranking_scores = raw_scores.copy()
        if 'service_radius_km' in self.workers_df.columns:
            within_radius = dists <= self.workers_df['service_radius_km'].to_numpy()
            ranking_scores = np.where(within_radius, ranking_scores, ranking_scores * 0.5)

        top_idx    = np.argsort(-ranking_scores)[:top_k]
        candidates = self.workers_df.iloc[top_idx].copy()
        candidates['semantic_score'] = raw_scores[top_idx].round(4)  # pure score
        candidates['distance_km']    = dists[top_idx].round(2)        # reused in rerank
        return candidates.reset_index(drop=True)

    # ── Stage 2: heuristic reranker ───────────────────────────────────────────

    def rerank(self, job: dict, candidates: pd.DataFrame) -> pd.DataFrame:
        """Score each candidate on location, performance, and rate fit."""
        df = candidates.copy()
        df['location_score']    = df.apply(lambda w: self._location_score(w),       axis=1)
        df['performance_score'] = df.apply(lambda w: self._performance_score(w),    axis=1)
        df['rate_score']        = df.apply(lambda w: self._rate_score(job, w),      axis=1)
        df['final_score'] = (
            WEIGHTS['semantic']    * df['semantic_score']    +
            WEIGHTS['location']    * df['location_score']    +
            WEIGHTS['performance'] * df['performance_score'] +
            WEIGHTS['rate']        * df['rate_score']
        ).round(4)
        return df.sort_values('final_score', ascending=False).reset_index(drop=True)

    # ── Full pipeline ─────────────────────────────────────────────────────────

    def match(self, job: dict, top_k: int = 5) -> pd.DataFrame:
        """Full two-stage pipeline. Returns top_k workers with score breakdown."""
        candidates = self.retrieve(job, top_k=50)
        ranked     = self.rerank(job, candidates)
        cols = [
            'worker_id', 'name', 'primary_category', 'location_name',
            'daily_rate_naira', 'completed_gigs', 'avg_rating', 'kudiscore_tier',
            'bvn_verified', 'distance_km',
            'semantic_score', 'location_score', 'performance_score', 'rate_score',
            'final_score',
        ]
        present = [c for c in cols if c in ranked.columns]
        return ranked[present].head(top_k)

    # ── Score sub-functions ───────────────────────────────────────────────────

    @staticmethod
    def _location_score(worker: pd.Series) -> float:
        # distance_km already computed in retrieve() — no second haversine pass
        dist = worker['distance_km']
        if dist < 10:
            return 1.00
        if dist < 30:
            return 0.85
        if dist < 100:
            return 0.60
        if dist < 300:
            return 0.35
        return max(0.0, 1.0 - dist / 800.0)

    @staticmethod
    def _performance_score(worker: pd.Series) -> float:
        gigs = int(worker.get('completed_gigs') or 0)

        if gigs == 0:
            # Cold-start: neutral 0.35 prior + small signals from verification
            tier_score = {'bronze': 0.30, 'silver': 0.65, 'gold': 1.00}.get(
                worker.get('kudiscore_tier'), 0.0
            )
            bvn_bonus = 0.10 if worker.get('bvn_verified') else 0.0
            return round(min(1.0, 0.35 + tier_score * 0.10 + bvn_bonus), 4)

        gig_score = min(1.0, math.log1p(gigs) / math.log1p(100))

        # Prefer completion_rate (behavioural) over avg_rating (subjective)
        cr = worker.get('completion_rate')
        ar = worker.get('avg_rating')
        if cr is not None:
            quality_score = float(cr)
        elif ar is not None:
            quality_score = (float(ar) - 1.0) / 4.0
        else:
            quality_score = 0.5  # unknown quality — neutral

        tier_score = {'bronze': 0.30, 'silver': 0.65, 'gold': 1.00}.get(
            worker.get('kudiscore_tier'), 0.30
        )
        bvn_bonus = 0.05 if worker.get('bvn_verified') else 0.0
        return round(min(1.0, 0.35 * gig_score + 0.40 * quality_score
                         + 0.20 * tier_score + bvn_bonus), 4)

    @staticmethod
    def _rate_score(job: dict, worker: pd.Series) -> float:
        # Directional: worker asks ≤ budget → full score.
        # Worker asks more → penalise proportionally. Hard penalty is intentional —
        # employers won't pay over budget; the effect should show clearly in hero example #3.
        budget = job['budget_naira']
        rate   = worker['daily_rate_naira']
        if rate <= budget:
            return 1.0
        return round(max(0.0, 1.0 - (rate - budget) / budget), 4)

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _l2_normalise(matrix: np.ndarray) -> np.ndarray:
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        norms = np.where(norms == 0, 1.0, norms)
        return matrix / norms

    def _require_workers(self) -> None:
        if self._embeddings is None or self.workers_df is None:
            raise RuntimeError("Call load_workers() before retrieve() or match().")
