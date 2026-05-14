import pickle
from pathlib import Path
from typing import Any

class Artifact:
    """Wrapper around the loaded model artifact bundle."""
    
    def __init__(self, artifact: dict[str, Any]):
        self.model = artifact['model']
        self.calibrator = artifact['calibrator']
        self.feature_cols: list[str] = artifact['feature_cols']
        self.categorical_cols: list[str] = artifact['categorical_cols']
        self.known_categories: dict[str, list] = artifact['known_categories']
        self.model_version: str = artifact['model_version']
        self.training_metrics: dict = artifact['training_metrics']
        self.fraud_model = artifact.get('fraud_model')  # optional
    
    @classmethod
    def load(cls, path: Path | str) -> 'Artifact':
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"Artifact not found: {path}")
        with open(path, 'rb') as f:
            artifact = pickle.load(f)
        instance = cls(artifact)
        instance._validate()
        return instance
    
    def _validate(self):
        """Sanity-check schema only — no model.predict() call at startup."""
        assert len(self.feature_cols) > 0, "feature_cols is empty"
        assert all(c in self.feature_cols for c in self.categorical_cols), \
            "categorical_cols contains features not in feature_cols"
        assert all(c in self.known_categories for c in self.categorical_cols), \
            "categorical_cols missing from known_categories"