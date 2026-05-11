"""
Job matching pipeline for fast retrieval, reranking, and learned final ranking.

Architecture:
- Stage 1: bi-encoder retrieval with sentence-transformers/LaBSE embeddings.
- Stage 2: cross-encoder reranking with cross-encoder/ms-marco-MiniLM-L-6-v2.
- Final rank: blend semantic score with location, rate compatibility, completion history,
  language match, and recency via a LightGBM ranker or fallback heuristic.

This module is written for a hackathon demo and is intentionally easy to adapt
for pgvector/pgvector-backed Postgres search or Qdrant. It also documents the
natural v2 improvement path: Afro-XLM-R multilingual embeddings and a
multilingual reranker.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Dict, Iterable, List, Optional, Sequence, Tuple, Union

import numpy as np
import pandas as pd
from lightgbm import LGBMRanker
from sentence_transformers import CrossEncoder, SentenceTransformer, util


NIGERIAN_LANGUAGES = ['English', 'Hausa', 'Igbo', 'Yoruba', 'Nigerian-Pidgin']


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return great-circle distance between two points in kilometers."""
    r = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1 - a)))


@dataclass
class RankerFeatures:
    location_distance_km: float
    completion_rate: float
    rate_compatibility: float
    language_match: int
    recency_days: float
    semantic_similarity: float

    def to_dict(self) -> dict:
        return {
            'location_distance_km': self.location_distance_km,
            'completion_rate': self.completion_rate,
            'rate_compatibility': self.rate_compatibility,
            'language_match': self.language_match,
            'recency_days': self.recency_days,
            'semantic_similarity': self.semantic_similarity,
        }


@dataclass
class CandidateMetadata:
    candidate_id: str
    location_lat: float
    location_lon: float
    min_rate: float
    max_rate: float
    completion_rate: float
    languages: List[str]
    last_active_at: datetime
    profile_text: str
    skills: List[str]
    embedding: Optional[np.ndarray] = None


@dataclass
class JobPosting:
    job_id: str
    location_lat: float
    location_lon: float
    min_rate: float
    max_rate: float
    languages: List[str]
    posted_at: datetime
    description: str
    skills: List[str]
    embedding: Optional[np.ndarray] = None


class InMemoryVectorIndex:
    """Simple in-memory candidate index for fast prototype retrieval."""

    def __init__(self) -> None:
        self.ids: List[str] = []
        self.embeddings: List[np.ndarray] = []

    def upsert(self, ids: Sequence[str], embeddings: Sequence[np.ndarray]) -> None:
        self.ids = list(ids)
        self.embeddings = [np.asarray(vec, dtype=np.float32) for vec in embeddings]

    def search(self, query_embedding: np.ndarray, top_k: int = 200) -> List[Tuple[str, float]]:
        if len(self.embeddings) == 0:
            return []

        query_embedding = np.asarray(query_embedding, dtype=np.float32)
        corpus = np.vstack(self.embeddings)
        similarities = util.cos_sim(query_embedding, corpus)[0].cpu().numpy()
        top_idx = np.argsort(-similarities)[:top_k]
        return [(self.ids[i], float(similarities[i])) for i in top_idx]


class JobMatchingEngine:
    def __init__(self,
                 embedding_model_name: str = 'sentence-transformers/LaBSE',
                 reranker_model_name: str = 'cross-encoder/ms-marco-MiniLM-L-6-v2',
                 ranker: Optional[LGBMRanker] = None) -> None:
        self.embedder = SentenceTransformer(embedding_model_name)
        self.reranker = CrossEncoder(reranker_model_name)
        self.vector_index = InMemoryVectorIndex()
        self.ranker = ranker

    def embed_texts(self, texts: Sequence[str]) -> np.ndarray:
        return np.asarray(self.embedder.encode(texts, convert_to_numpy=True, show_progress_bar=False), dtype=np.float32)

    def load_candidates(self, candidates: Sequence[CandidateMetadata]) -> None:
        ids = [c.candidate_id for c in candidates]
        embeddings = [c.embedding for c in candidates]
        if any(e is None for e in embeddings):
            embeddings = list(self.embed_texts([c.profile_text for c in candidates]))
            for c, emb in zip(candidates, embeddings):
                c.embedding = emb
        self.vector_index.upsert(ids, embeddings)

    def semantic_stage1(self,
                        query_text: str,
                        candidates: Dict[str, CandidateMetadata],
                        top_k: int = 200) -> List[Tuple[CandidateMetadata, float]]:
        query_emb = self.embed_texts([query_text])[0]
        results = self.vector_index.search(query_emb, top_k=top_k)
        return [(candidates[cid], score) for cid, score in results if cid in candidates]

    def rerank_stage2(self,
                      query_text: str,
                      stage1_results: Sequence[Tuple[CandidateMetadata, float]],
                      top_k: int = 10) -> List[Tuple[CandidateMetadata, float]]:
        if not stage1_results:
            return []

        candidate_texts = [candidate.profile_text for candidate, _ in stage1_results]
        scores = self.reranker.predict([(query_text, text) for text in candidate_texts])
        ranked = sorted(
            zip([candidate for candidate, _ in stage1_results], scores),
            key=lambda item: item[1],
            reverse=True,
        )
        return ranked[:top_k]

    def build_ranker_features(self,
                              query_text: str,
                              job: JobPosting,
                              candidate: CandidateMetadata,
                              semantic_similarity: float) -> RankerFeatures:
        language_match = int(bool(set(job.languages) & set(candidate.languages)))
        distance_km = haversine_distance(job.location_lat, job.location_lon,
                                         candidate.location_lat, candidate.location_lon)
        recency_days = float((datetime.utcnow() - candidate.last_active_at).total_seconds() / 86400.0)
        rate_compat = self._compute_rate_compatibility(job, candidate)

        return RankerFeatures(
            location_distance_km=distance_km,
            completion_rate=candidate.completion_rate,
            rate_compatibility=rate_compat,
            language_match=language_match,
            recency_days=recency_days,
            semantic_similarity=semantic_similarity,
        )

    @staticmethod
    def _compute_rate_compatibility(job: JobPosting, candidate: CandidateMetadata) -> float:
        overlap_min = max(job.min_rate, candidate.min_rate)
        overlap_max = min(job.max_rate, candidate.max_rate)
        if overlap_min > overlap_max:
            return 0.0
        salary_span = max(job.max_rate, candidate.max_rate) - min(job.min_rate, candidate.min_rate)
        if salary_span <= 0:
            return 1.0
        return float((overlap_max - overlap_min) / salary_span)

    def score_with_ranker(self,
                          query_text: str,
                          job: JobPosting,
                          candidate: CandidateMetadata,
                          semantic_similarity: float) -> float:
        features = self.build_ranker_features(query_text, job, candidate, semantic_similarity)
        feature_vector = pd.DataFrame([features.to_dict()])

        if self.ranker is not None:
            return float(self.ranker.predict(feature_vector)[0])

        # Fallback heuristic for demo purposes.
        weighted = (
            0.45 * semantic_similarity +
            0.20 * features.language_match +
            0.15 * features.completion_rate +
            0.10 * features.rate_compatibility +
            0.05 * max(0.0, 1.0 - features.location_distance_km / 100.0) +
            0.05 * max(0.0, 1.0 - features.recency_days / 30.0)
        )
        return float(weighted)

    def rank_candidates(self,
                        query_text: str,
                        job: JobPosting,
                        candidates: Dict[str, CandidateMetadata],
                        top_k: int = 10) -> pd.DataFrame:
        stage1 = self.semantic_stage1(query_text, candidates, top_k=200)
        if not stage1:
            return pd.DataFrame(columns=['candidate_id', 'score', 'rerank_score', 'final_score'])

        stage2 = self.rerank_stage2(query_text, stage1, top_k=top_k)
        rows = []
        for candidate, rerank_score in stage2:
            features = self.build_ranker_features(query_text, job, candidate, rerank_score)
            final_score = self.score_with_ranker(query_text, job, candidate, rerank_score)
            rows.append({
                'candidate_id': candidate.candidate_id,
                'rerank_score': rerank_score,
                'final_score': final_score,
                **features.to_dict(),
            })

        return pd.DataFrame(sorted(rows, key=lambda r: r['final_score'], reverse=True))


def create_ranking_model() -> LGBMRanker:
    return LGBMRanker(
        objective='lambdarank',
        metric='ndcg',
        boosting_type='gbdt',
        n_estimators=200,
        learning_rate=0.05,
        num_leaves=64,
    )
