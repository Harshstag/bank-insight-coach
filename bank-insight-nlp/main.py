# python
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException
import pandas as pd
import os
import json

from services.categorizer import categorize_transaction
from services.insights import generate_insights
from services.signal_generator import generate_signals
from services.nlp_engine import generate_nlp_notification
from services.transaction_loader import load_transactions
from services.chat_context_builder import build_chat_context
from services.memory_service import add_to_memory, recall_past_conversations

app = FastAPI()

CSV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads", "transactions.csv")


def compute_insights():
    # shared processing: read CSV, categorize, generate insights, return JSON-serializable dict
    if not os.path.exists(CSV_PATH):
        raise HTTPException(status_code=404, detail="Transactions CSV not found. Please upload file first.")

    df = load_transactions()
    # Use both description (priority) and merchant for categorization
    if "description" in df.columns and "merchant" in df.columns:
        df["category"] = df.apply(
            lambda row: categorize_transaction(
                description=row.get("description", ""),
                merchant=row.get("merchant", "")
            ),
            axis=1
        )
    elif "merchant" in df.columns:
        df["category"] = df["merchant"].apply(lambda m: categorize_transaction("", m))
    
    # Save the updated CSV with the category column
    df.to_csv(CSV_PATH, index=False)
    
    insights = generate_insights(df)
    transactions = json.loads(df.to_json(orient="records", date_format="iso"))

    return {"transactions": transactions, "insights": insights}


@app.get("/insights")
def get_insights():
    return compute_insights()


@app.post("/recalculate")
def recalculate():
    # trigger recalculation by reusing the same helper
    return compute_insights()


@app.get("/nlpNotification")
def get_nlp_notification():
    signals = generate_signals()
    nlp = generate_nlp_notification(signals)

    return {
        "signals": signals,
        "nlpNotification": nlp
    }


@app.get("/chat-context")
def get_chat_context(query: str = None):
    """
    RAG retrieval endpoint — returns the full financial context of the user's
    uploaded statement, plus relevant offers.
    Called by Spring Boot before every chatbot message.
    """
    return build_chat_context(user_query=query)


@app.post("/add-memory")
def post_add_memory(data: dict):
    """Store a user/assistant turn in long-term memory."""
    user_msg = data.get("user")
    ai_msg = data.get("assistant")
    if user_msg and ai_msg:
        add_to_memory(user_msg, ai_msg)
        return {"status": "success"}
    return {"status": "error", "message": "Missing user or assistant message"}


@app.get("/recall-memory")
def get_recall_memory(query: str):
    """Recall similar past interactions from long-term memory."""
    return recall_past_conversations(query)