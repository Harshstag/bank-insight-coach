import pandas as pd
import os

# Get the absolute path to the uploads folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(os.path.dirname(BASE_DIR), "uploads", "transactions.csv")

def load_transactions():
    df = pd.read_csv(
        CSV_PATH,
        engine="python",
        on_bad_lines="skip",
        encoding="utf-8-sig",
    )
    # Parse transaction date robustly
    if "txn_date" in df.columns:
        df["txn_date"] = pd.to_datetime(df["txn_date"], errors="coerce")
    return df
