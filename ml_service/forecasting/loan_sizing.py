def size_loan(gap_naira: float, kudi_score: int | None = None) -> int:
    """
    Size a micro-loan based on predicted income gap. Returns amount in kobo.

    gap_naira: sum of daily shortfalls during the dip window
    kudi_score: optional KudiScore (300–850) used to cap the offer
    """
    raw = gap_naira * 1.20
    rounded = round(raw / 5_000) * 5_000
    amount = max(10_000, rounded)

    if kudi_score is not None:
        if kudi_score >= 750:
            cap = 500_000
        elif kudi_score >= 600:
            cap = 200_000
        elif kudi_score >= 450:
            cap = 100_000
        else:
            cap = 50_000
    else:
        cap = 200_000

    amount = min(amount, cap)
    return int(amount * 100)  # naira → kobo
