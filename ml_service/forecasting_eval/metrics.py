import numpy as np
import pandas as pd


def mae(actual: np.ndarray, predicted: np.ndarray) -> float:
    return float(np.mean(np.abs(predicted - actual)))


def rmse(actual: np.ndarray, predicted: np.ndarray) -> float:
    return float(np.sqrt(np.mean((predicted - actual) ** 2)))


def mase(actual: np.ndarray, predicted: np.ndarray, seasonal_naive: np.ndarray) -> float:
    naive_mae = float(np.mean(np.abs(seasonal_naive - actual)))
    if naive_mae == 0:
        return float("inf")
    return mae(actual, predicted) / naive_mae


def coverage(actual: np.ndarray, lower: np.ndarray, upper: np.ndarray) -> float:
    return float(np.mean((actual >= lower) & (actual <= upper)))


def summarise(results: pd.DataFrame) -> None:
    print(f"n users        : {len(results)}")
    print(f"Median MAE     : ₦{results['mae'].median():,.0f}")
    print(f"MAE % of mean  : {results['mae_pct_of_mean'].median():.1%}")
    print(f"Median MASE    : {results['mase'].median():.3f}")
    print(f"Mean 80% cov.  : {results['coverage_80'].mean():.2%}")
