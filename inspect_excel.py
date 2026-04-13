
import os
import openpyxl

file_path = "IDFCFIRSTBankstatement_10198365948_121055294.xlsx"
if os.path.exists(file_path):
    try:
        wb = openpyxl.load_workbook(file_path)
        sheet = wb.active
        headers = [cell.value for cell in sheet[1]]
        # Read a few rows to help understand data
        rows = []
        for i, row in enumerate(sheet.iter_rows(min_row=2, max_row=4, values_only=True)):
            rows.append(row)
            
        with open("excel_cols.txt", "w") as f:
            f.write(str(headers) + "\n")
            f.write(str(rows))
    except Exception as e:
        with open("excel_cols.txt", "w") as f:
            f.write(f"Error: {e}")
else:
    with open("excel_cols.txt", "w") as f:
        f.write("File not found.")
