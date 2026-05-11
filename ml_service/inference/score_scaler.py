import numpy as np

def pd_to_score(pd_value: float) -> int:
    """Map calibrated PD to 300-850 score via logistic mapping.
    
    Logit-based scaling: each unit of logit = ~70 score points.
    At PD=0.5 (logit=0), score=575 (midpoint of 300-850).
    """
    pd_clipped = np.clip(pd_value, 1e-6, 1 - 1e-6)
    logit = np.log(pd_clipped / (1 - pd_clipped))
    score = 575 - 70 * logit
    return int(np.clip(round(score), 300, 850))

# Vectorized version for batch use
def pd_to_score_batch(pd_array: np.ndarray) -> np.ndarray:
    pd_clipped = np.clip(pd_array, 1e-6, 1 - 1e-6)
    logit = np.log(pd_clipped / (1 - pd_clipped))
    scores = 575 - 70 * logit
    return np.clip(np.round(scores), 300, 850).astype(int)
