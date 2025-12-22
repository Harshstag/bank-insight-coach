# python
from fastapi import FastAPI, HTTPException
import pandas as pd
import os
import json

from services.categorizer import categorize_transaction
from services.insights import generate_insights
from services.signal_generator import generate_signals
from services.nlp_engine import generate_nlp_notification
from services.transaction_loader import load_transactions

app = FastAPI()

CSV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads", "transactions.csv")


def compute_insights():
    # shared processing: read CSV, categorize, generate insights, return JSON-serializable dict
    if not os.path.exists(CSV_PATH):
        raise HTTPException(status_code=404, detail="Transactions CSV not found. Please upload file first.")

    df = load_transactions()
    if "merchant" in df.columns:
        df["category"] = df["merchant"].apply(categorize_transaction)
    insights = generate_insights(df)
    transactions = json.loads(df.to_json(orient="records"))

    return {"transactions": transactions, "insights": insights}


@app.get("/insights")
def get_insights():
    return compute_insights()


@app.post("/recalculate")
def recalculate():
    # trigger recalculation by reusing the same helper
    return compute_insights()


@app.get("/nlpNotification")
def get_insights():
    signals = generate_signals()
    nlp = generate_nlp_notification(signals)

    return {
        "signals": signals,
        "nlpNotification": nlp
    }