import pandas as pd
from services.categorizer import categorize_transaction


def add_category(df):
    # Use both description (priority) and merchant for better categorization
    df["category"] = df.apply(
        lambda row: categorize_transaction(
            description=row.get("description", ""),
            merchant=row.get("merchant", "")
        ),
        axis=1
    )
    return df


def _to_float_dict(series):
    """Convert a grouped series to a plain dict with native floats."""
    return {k: float(v) for k, v in series.to_dict().items()}


def generate_insights(df):
    # Ensure amount is numeric and cast to native float for JSON safety
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0)
    
    # Convert txn_date to datetime for weekly calculations
    df["txn_date"] = pd.to_datetime(df["txn_date"])

    insights = {}

    # Filter for DEBIT transactions only (spending)
    debit_df = df[df["txn_type"].str.upper() == "DEBIT"]
    
    # Filter for CREDIT transactions only (income)
    credit_df = df[df["txn_type"].str.upper() == "CREDIT"]

    # Category totals for DEBIT only
    insights["category_totals"] = _to_float_dict(
        debit_df.groupby("category")["amount"].sum()
    )

    # Monthly spend (DEBIT only)
    insights["monthly_spend"] = float(debit_df["amount"].sum())
    
    # Total income (CREDIT only)
    insights["total_income"] = float(credit_df["amount"].sum())

    # Top merchants (DEBIT only)
    insights["top_merchants"] = _to_float_dict(
        debit_df.groupby("merchant")["amount"]
        .sum()
        .sort_values(ascending=False)
        .head(5)
    )
    
    # Weekly spend breakdown
    weekly_spend = debit_df.groupby(debit_df["txn_date"].dt.to_period("W"))["amount"].sum()
    insights["weekly_spend"] = {str(week): float(amount) for week, amount in weekly_spend.items()}
    
    # Top categories by spending
    insights["top_categories"] = _to_float_dict(
        debit_df.groupby("category")["amount"]
        .sum()
        .sort_values(ascending=False)
        .head(5)
    )
    
    # Savings rate (income - spend)
    total_income = insights["total_income"]
    total_spend = insights["monthly_spend"]
    savings = total_income - total_spend
    savings_rate = (savings / total_income * 100) if total_income > 0 else 0
    
    insights["total_savings"] = float(savings)
    insights["savings_rate"] = round(savings_rate, 2)
    
    # Average transaction value
    avg_transaction = debit_df["amount"].mean() if len(debit_df) > 0 else 0
    insights["avg_transaction_value"] = round(float(avg_transaction), 2)
    
    # Transaction counts
    total_debit_count = int(len(debit_df))
    total_credit_count = int(len(credit_df))
    insights["total_expense_transactions"] = total_debit_count
    insights["total_income_transactions"] = total_credit_count
    insights["total_transactions"] = int(len(df))
    
    # Daily average spending
    if len(debit_df) > 0:
        num_days = (debit_df["txn_date"].max() - debit_df["txn_date"].min()).days + 1
        daily_avg_spend = insights["monthly_spend"] / num_days if num_days > 0 else 0
    else:
        daily_avg_spend = 0
    insights["daily_avg_spend"] = round(float(daily_avg_spend), 2)
    
    # Daily average income (based on 30 days per month)
    daily_avg_income = insights["total_income"] / 30 if len(credit_df) > 0 else 0
    insights["daily_avg_income"] = round(float(daily_avg_income), 2)
    
    # Highest spending category
    if insights["top_categories"]:
        insights["highest_spending_category"] = max(insights["top_categories"], 
                                                     key=insights["top_categories"].get)
    
    # Highest spending merchant
    if insights["top_merchants"]:
        insights["highest_spending_merchant"] = max(insights["top_merchants"], 
                                                     key=insights["top_merchants"].get)
    
    # Daily breakdown by category
    daily_by_category = debit_df.groupby([debit_df["txn_date"].dt.date, "category"])["amount"].sum().unstack(fill_value=0)
    insights["daily_category_breakdown"] = {str(date): {cat: float(amount) for cat, amount in row.items() if amount > 0} 
                                            for date, row in daily_by_category.iterrows()}
    
    # Spending by transaction type percentage
    total_all_txn = total_debit_count + total_credit_count
    insights["transaction_type_distribution"] = {
        "debit_percentage": round((total_debit_count / total_all_txn * 100) if total_all_txn > 0 else 0, 2),
        "credit_percentage": round((total_credit_count / total_all_txn * 100) if total_all_txn > 0 else 0, 2)
    }
    
    # Expense vs Income ratio
    if insights["total_income"] > 0:
        expense_to_income_ratio = insights["monthly_spend"] / insights["total_income"]
    else:
        expense_to_income_ratio = 0
    insights["expense_to_income_ratio"] = round(expense_to_income_ratio, 2)
    
    # Max single transaction
    insights["max_transaction_amount"] = float(debit_df["amount"].max()) if len(debit_df) > 0 else 0
    insights["min_transaction_amount"] = float(debit_df["amount"].min()) if len(debit_df) > 0 else 0
    
    # Date range
    insights["date_range"] = {
        "start_date": str(df["txn_date"].min().date()),
        "end_date": str(df["txn_date"].max().date())
    }
    
    # Monthly Investment, EMI, SIP totals (for AI recommendations and dashboard)
    insights["monthly_investment"] = float(debit_df[debit_df["category"] == "Investment"]["amount"].sum())
    insights["monthly_emi"] = float(debit_df[debit_df["category"] == "EMI"]["amount"].sum())
    insights["monthly_sip"] = float(debit_df[debit_df["category"] == "SIP"]["amount"].sum())

    return insights

