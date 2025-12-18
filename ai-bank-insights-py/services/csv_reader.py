import pandas as pd

def read_transactions(csv_path: str):
    df = pd.read_csv(csv_path)
    return df
