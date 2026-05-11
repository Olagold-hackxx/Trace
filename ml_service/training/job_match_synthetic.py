"""
Synthetic data generation for job matching and learning-to-rank training.

This module provides helpers to create Nigerian job board-style job postings,
candidate profiles, and match-outcome labels that blend semantic compatibility,
location proximity, language alignment, rate compatibility, and activity recency.

The synthetic dataset is intended to support the hackathon demo for a two-stage
retrieval + reranking architecture with a final LightGBM ranker.
"""

from __future__ import annotations

import random
from datetime import datetime, timedelta
from typing import Iterable, List, Optional

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from lightgbm import LGBMRanker

from training.job_match_engine import (
    JobPosting,
    CandidateMetadata,
    RankerFeatures,
    create_ranking_model,
    haversine_distance,
)


NIGERIAN_LANGUAGES = ['English', 'Hausa', 'Igbo', 'Yoruba', 'Nigerian-Pidgin']
JOB_CATEGORIES = [
    'Customer Support', 'Software Engineer', 'Sales Executive', 'Logistics Coordinator',
    'Retail Supervisor', 'HR Generalist', 'Digital Marketer', 'Operations Manager',
    'Accountant', 'Field Technician', 'Content Creator', 'Product Manager',
]
CITY_LOCATIONS = [
    ('Lagos', 6.5244, 3.3792),
    ('Abuja', 9.0765, 7.3986),
    ('Ibadan', 7.3775, 3.9470),
    ('Port Harcourt', 4.8156, 7.0498),
    ('Kano', 12.0022, 8.5919),
    ('Enugu', 6.5244, 7.5189),
]
SKILL_BUCKETS = {
    'Software Engineer': ['python', 'django', 'rest', 'sql', 'git'],
    'Digital Marketer': ['social media', 'google ads', 'content', 'seo', 'analytics'],
    'Sales Executive': ['customer service', 'negotiation', 'crm', 'lead generation'],
    'Accountant': ['excel', 'bookkeeping', 'tax', 'quickbooks', 'reporting'],
    'HR Generalist': ['recruitment', 'payroll', 'employee relations', 'hr policies'],
}


def _pick_language() -> List[str]:
    return [random.choice(NIGERIAN_LANGUAGES)]


def _build_description(category: str, language: List[str]) -> str:
    base = f"Hiring a {category} with strong communication and problem-solving skills."
    if 'Hausa' in language:
        return base + ' (Aiki a shirye tare da abokan hulɗa na Hausa.)'
    if 'Igbo' in language:
        return base + ' (Ndị Igbo nwere ike yin aikọ.)'
    if 'Yoruba' in language:
        return base + ' (Iṣẹ fun awọn ti o mọ Yoruba.)'
    if 'Nigerian-Pidgin' in language:
        return base + ' (We dey find pesin wey sabi work well.)'
    return base + ' Fluent English is required.'


def generate_job_postings(n_jobs: int = 200,
                          seed: Optional[int] = 42) -> pd.DataFrame:
    random.seed(seed)
    jobs = []
    now = datetime.utcnow()

    for idx in range(n_jobs):
        category = random.choice(JOB_CATEGORIES)
        city, lat, lon = random.choice(CITY_LOCATIONS)
        language = _pick_language()
        min_rate = random.randint(40000, 120000)
        max_rate = min_rate + random.randint(10000, 50000)
        posted_at = now - timedelta(days=random.randint(0, 30))

        jobs.append({
            'job_id': f'job_{idx:05d}',
            'category': category,
            'description': _build_description(category, language),
            'skills': ','.join(SKILL_BUCKETS.get(category, ['communication', 'teamwork'])),
            'languages': language,
            'location_lat': lat,
            'location_lon': lon,
            'min_rate': min_rate,
            'max_rate': max_rate,
            'posted_at': posted_at,
            'completion_rate': random.uniform(0.55, 0.95),
        })

    return pd.DataFrame(jobs)


def generate_candidate_profiles(n_candidates: int = 500,
                                seed: Optional[int] = 42) -> pd.DataFrame:
    random.seed(seed)
    candidates = []
    now = datetime.utcnow()

    for idx in range(n_candidates):
        category = random.choice(JOB_CATEGORIES)
        city, lat, lon = random.choice(CITY_LOCATIONS)
        language = _pick_language()
        min_rate = random.randint(30000, 100000)
        max_rate = min_rate + random.randint(5000, 40000)
        last_active_at = now - timedelta(days=random.randint(0, 45))

        candidates.append({
            'candidate_id': f'cand_{idx:05d}',
            'profile_text': f"Experienced {category} candidate with strong local network and digital skills.",
            'skills': ','.join(SKILL_BUCKETS.get(category, ['communication', 'adaptability'])),
            'languages': language,
            'location_lat': lat,
            'location_lon': lon,
            'min_rate': min_rate,
            'max_rate': max_rate,
            'completion_rate': random.uniform(0.45, 0.98),
            'last_active_at': last_active_at,
        })

    return pd.DataFrame(candidates)


def synthesize_match_pairs(job_df: pd.DataFrame,
                           candidate_df: pd.DataFrame,
                           n_pairs_per_job: int = 15,
                           seed: Optional[int] = 42) -> pd.DataFrame:
    rng = random.Random(seed)
    rows = []

    for _, job in job_df.iterrows():
        sampled_candidates = candidate_df.sample(n=min(n_pairs_per_job, len(candidate_df)), random_state=rng.randint(0, 10**6))
        for _, candidate in sampled_candidates.iterrows():
            language_match = int(bool(set(job['languages']) & set(candidate['languages'])))
            location_km = haversine_distance(job['location_lat'], job['location_lon'],
                                             candidate['location_lat'], candidate['location_lon'])
            rate_overlap = max(0.0, min(job['max_rate'], candidate['max_rate']) - max(job['min_rate'], candidate['min_rate']))
            rate_span = max(job['max_rate'], candidate['max_rate']) - min(job['min_rate'], candidate['min_rate'])
            rate_compatibility = rate_overlap / rate_span if rate_span > 0 else 1.0
            recency_days = (datetime.utcnow() - candidate['last_active_at']).days
            completion_rate = candidate['completion_rate']

            # Synthetic outcome label: strong if rate, language and proximity align.
            score = (
                0.35 * language_match +
                0.25 * completion_rate +
                0.20 * rate_compatibility +
                0.15 * max(0.0, 1.0 - location_km / 150.0) +
                0.05 * max(0.0, 1.0 - recency_days / 60.0)
            )
            label = int(score > 0.55 or (score > 0.45 and rng.random() < 0.5))

            rows.append({
                'job_id': job['job_id'],
                'candidate_id': candidate['candidate_id'],
                'language_match': language_match,
                'location_distance_km': location_km,
                'rate_compatibility': rate_compatibility,
                'completion_rate': completion_rate,
                'recency_days': recency_days,
                'semantic_similarity': random.uniform(0.3, 0.95),
                'label': label,
            })

    return pd.DataFrame(rows)


def train_ranker(pair_df: pd.DataFrame,
                 group_col: str = 'job_id',
                 label_col: str = 'label',
                 test_size: float = 0.2,
                 seed: Optional[int] = 42) -> Tuple[LGBMRanker, pd.DataFrame, pd.DataFrame]:
    feature_cols = ['language_match', 'location_distance_km', 'rate_compatibility',
                    'completion_rate', 'recency_days', 'semantic_similarity']
    X = pair_df[feature_cols]
    y = pair_df[label_col]
    q = pair_df[group_col].astype('category').cat.codes

    X_train, X_test, y_train, y_test, q_train, q_test = train_test_split(
        X, y, q, test_size=test_size, random_state=seed,
    )

    ranker = create_ranking_model()
    ranker.fit(
        X_train, y_train,
        group=q_train.tolist(),
        eval_set=[(X_test, y_test)],
        eval_group=[q_test.tolist()],
        eval_at=[1, 3, 5],
        verbose=False,
    )

    train_df = pd.concat([X_train, y_train.reset_index(drop=True)], axis=1)
    test_df = pd.concat([X_test, y_test.reset_index(drop=True)], axis=1)
    return ranker, train_df, test_df


if __name__ == '__main__':
    jobs = generate_job_postings(n_jobs=100)
    candidates = generate_candidate_profiles(n_candidates=400)
    pairs = synthesize_match_pairs(jobs, candidates)
    ranker, train_df, test_df = train_ranker(pairs)
    print('Generated jobs:', len(jobs))
    print('Generated candidates:', len(candidates))
    print('Training pairs:', len(train_df))
    print('Test pairs:', len(test_df))
