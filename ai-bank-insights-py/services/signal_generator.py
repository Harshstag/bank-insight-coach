from datetime import timedelta
import pandas as pd
from .transaction_loader import load_transactions
from .categorizer import categorize_transaction

def generate_signals():
    df = load_transactions()

    # Only DEBIT transactions
    df = df[df["txn_type"] == "DEBIT"]
    
    # Add category column using both description (priority) and merchant
    # Description is prioritized for better accuracy with QR payments and user notes
    df["category"] = df.apply(
        lambda row: categorize_transaction(
            description=row.get("description", ""),
            merchant=row.get("merchant", "")
        ),
        axis=1
    )
    
    # Get the most recent transaction's category
    most_recent_category = df.iloc[-1]["category"] if len(df) > 0 else None

    today = pd.Timestamp.today()
    last_7_days = today - timedelta(days=7)
    last_28_days = today - timedelta(days=28)

    weekly = df[df["txn_date"] >= last_7_days].copy()
    monthly = df[df["txn_date"] >= last_28_days].copy()

    # Get all unique categories
    all_categories = pd.concat([weekly["category"], monthly["category"]]).unique()
    
    signals = {
        "total_weekly_spend": float(weekly["amount"].sum()),
        "total_monthly_spend": float(monthly["amount"].sum()),
        "weekly_avg": float(monthly["amount"].sum() / 4) if len(monthly) > 0 else 0,
        "most_recent_category": most_recent_category,
        "categories": {}
    }
    
    # Generate signals for each category
    for category in all_categories:
        category_weekly = weekly[weekly["category"] == category]["amount"].sum()
        category_monthly = monthly[monthly["category"] == category]["amount"].sum()
        category_weekly_avg = category_monthly / 4 if category_monthly > 0 else 0
        
        spike_percent = round(
            ((category_weekly - category_weekly_avg) / category_weekly_avg) * 100, 2
        ) if category_weekly_avg > 0 else 0
        
        signals["categories"][category] = {
            "weekly_spend": float(category_weekly),
            "monthly_spend": float(category_monthly),
            "weekly_avg": float(category_weekly_avg),
            "spike_percent": spike_percent,
            "percentage_of_total": round(
                (category_weekly / signals["total_weekly_spend"] * 100) if signals["total_weekly_spend"] > 0 else 0, 2
            )
        }
    print(df[["description", "merchant", "category"]].tail(10))

    return signals
