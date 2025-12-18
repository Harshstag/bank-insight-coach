from fastapi import FastAPI, HTTPException
import pandas as pd
import os
import json

from services.categorizer import categorize_transaction
from services.insights import generate_insights

app = FastAPI()

# 📍 Path where Spring Boot stores uploaded CSV
CSV_PATH = "../uploads/transactions.csv"


@app.get("/insights")
def get_insights():
    # 1️⃣ Check if file exists
    if not os.path.exists(CSV_PATH):
        raise HTTPException(
            status_code=404,
            detail="Transactions CSV not found. Please upload file first."
        )

    # 2️⃣ Read CSV into memory (DataFrame)
    df = pd.read_csv(CSV_PATH)

    # 3️⃣ Add category column (IN MEMORY ONLY)
    df["category"] = df["merchant"].apply(categorize_transaction)

    # 4️⃣ Generate insights
    insights = generate_insights(df)

    # 5️⃣ Return structured JSON with native types
    transactions = json.loads(df.to_json(orient="records"))

    return {
        "transactions": transactions,
        "insights": insights
    }
