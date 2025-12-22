import pandas as pd

def read_transactions(csv_path: str):
    df = pd.read_csv(
        csv_path,
        engine="python",
        on_bad_lines="skip",
        encoding="utf-8-sig",
    )
    return df
