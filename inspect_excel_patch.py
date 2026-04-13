
import os
try:
    import numpy
    numpy.float = float  # Patch for compatibility
except ImportError:
    pass

import openpyxl

file_path = "IDFCFIRSTBankstatement_10198365948_121055294.xlsx"
if os.path.exists(file_path):
    try:
        wb = openpyxl.load_workbook(file_path)
        sheet = wb.active
        
        rows = []
        for i, row in enumerate(sheet.iter_rows(min_row=21, max_row=50, values_only=True)):
            rows.append(f"Row {i+21}: {row}")
            
        with open("excel_cols.txt", "w") as f:
            f.write("\n".join(rows))
    except Exception as e:
        with open("excel_cols.txt", "w") as f:
            f.write(f"Error: {e}")
else:
    with open("excel_cols.txt", "w") as f:
        f.write("File not found.")
