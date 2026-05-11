import pandas as pd
from typing import Any

def validate_and_prepare(
    features: dict[str, Any],
    feature_cols: list[str],
    categorical_cols: list[str],
    known_categories: dict[str, list],
) -> pd.DataFrame:
    """Take incoming feature dict, return a DataFrame ready for model.predict().
    
    - Fills missing features with None (LightGBM handles NaN natively for numerics)
    - Maps unknown categoricals to 'Other' if 'Other' is a known category, else first known
    - Returns single-row DataFrame in correct column order with correct dtypes
    """
    row = {}
    for col in feature_cols:
        value = features.get(col)
        if col in categorical_cols:
            known = known_categories[col]
            if value is None or value not in known:
                value = 'Other' if 'Other' in known else known[0]
        row[col] = value
    
    df = pd.DataFrame([row], columns=feature_cols)
    
    for col in categorical_cols:
        df[col] = pd.Categorical(df[col], categories=known_categories[col])
    
    return df