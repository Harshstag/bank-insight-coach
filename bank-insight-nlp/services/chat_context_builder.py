import os
import json
from datetime import timedelta

import pandas as pd

from .transaction_loader import load_transactions
from .categorizer import categorize_transaction

CSV_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "..", "uploads", "transactions.csv"
)


def build_chat_context() -> dict:
    """
    Assemble a rich financial context object from the uploaded CSV.
    This is the RAG 'retrieval' step — all real user data is packed here
    before being injected into the Gemini system prompt.

    Returns a structured dict, or a minimal error dict if no CSV is found.
    """
    if not os.path.exists(CSV_PATH):
        return {"error": "no_data", "message": "No bank statement uploaded yet."}

    df = load_transactions()

    # ── Basic type cleanup ──────────────────────────────────────────────────
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0)
    df["txn_date"] = pd.to_datetime(df["txn_date"], errors="coerce")

    # Categorise every transaction (description takes priority over merchant)
    df["category"] = df.apply(
        lambda row: categorize_transaction(
            description=row.get("description", ""),
            merchant=row.get("merchant", ""),
        ),
        axis=1,
    )

    debit_df = df[df["txn_type"].astype(str).str.strip().str.upper() == "DEBIT"]
    credit_df = df[df["txn_type"].astype(str).str.strip().str.upper() == "CREDIT"]

    today = pd.Timestamp.today()
    last_30 = today - timedelta(days=30)
    last_7 = today - timedelta(days=7)

    monthly_debit = debit_df[debit_df["txn_date"] >= last_30]
    weekly_debit = debit_df[debit_df["txn_date"] >= last_7]

    # ── Income & spend summaries ────────────────────────────────────────────
    total_monthly_spend = float(monthly_debit["amount"].sum())
    total_weekly_spend = float(weekly_debit["amount"].sum())
    total_income = float(credit_df["amount"].sum())

    savings = total_income - total_monthly_spend
    savings_rate = round((savings / total_income * 100), 2) if total_income > 0 else 0.0

    # ── Top spending categories (last 30 days) ──────────────────────────────
    cat_totals = (
        monthly_debit.groupby("category")["amount"]
        .sum()
        .sort_values(ascending=False)
    )
    top_categories = [
        {
            "name": cat,
            "amount": round(float(amt), 2),
            "percentage": round((float(amt) / total_monthly_spend * 100), 2)
            if total_monthly_spend > 0
            else 0,
        }
        for cat, amt in cat_totals.items()
    ]

    # ── EMI / SIP / Investment breakdown ───────────────────────────────────
    def _cat_total(cat_name: str, src: pd.DataFrame) -> float:
        return float(src[src["category"] == cat_name]["amount"].sum())

    monthly_emi = _cat_total("EMI", monthly_debit)
    monthly_sip = _cat_total("SIP", monthly_debit)
    monthly_investment = _cat_total("Investment", monthly_debit)

    # ── Spending trend: compare this week vs average weekly spend ───────────
    avg_weekly = total_monthly_spend / 4 if total_monthly_spend > 0 else 0
    if avg_weekly > 0:
        delta_pct = ((total_weekly_spend - avg_weekly) / avg_weekly) * 100
        if delta_pct > 15:
            spending_trend = "INCREASING"
        elif delta_pct < -15:
            spending_trend = "DECREASING"
        else:
            spending_trend = "STABLE"
    else:
        spending_trend = "STABLE"

    # ── Date range of the statement ─────────────────────────────────────────
    date_range = {
        "start": str(df["txn_date"].min().date()) if not df.empty else "N/A",
        "end": str(df["txn_date"].max().date()) if not df.empty else "N/A",
    }

    # ── 5 most recent debit transactions ───────────────────────────────────
    recent_cols = ["txn_date", "merchant", "description", "amount", "category"]
    available_cols = [c for c in recent_cols if c in debit_df.columns]
    recent_txn_raw = (
        debit_df.sort_values("txn_date", ascending=False)
        .head(5)[available_cols]
        .copy()
    )
    # Make JSON-safe
    recent_txn_raw["txn_date"] = recent_txn_raw["txn_date"].astype(str)
    recent_transactions = json.loads(recent_txn_raw.to_json(orient="records"))

    return {
        "statement_period": date_range,
        "total_income": round(total_income, 2),
        "total_monthly_spend": round(total_monthly_spend, 2),
        "total_weekly_spend": round(total_weekly_spend, 2),
        "total_savings": round(savings, 2),
        "savings_rate_percent": savings_rate,
        "spending_trend": spending_trend,
        "monthly_emi": round(monthly_emi, 2),
        "monthly_sip": round(monthly_sip, 2),
        "monthly_investment": round(monthly_investment, 2),
        "top_categories": top_categories,
        "recent_transactions": recent_transactions,
        "total_transactions": int(len(df)),
    }
