package bank.insight.backend.service;

import bank.insight.backend.dto.TransactionRecord;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class StatementExtractionService {

    public List<TransactionRecord> extractFromCsv(MultipartFile file) throws Exception {

        List<TransactionRecord> list = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(file.getInputStream()))) {

            String line;
            boolean isGeneratedFormat = false;
            boolean firstLine = true;

            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    // Check if this is our generated format
                    if (line.toLowerCase().contains("txn_type") && line.toLowerCase().contains("amount")) {
                        isGeneratedFormat = true;
                    }
                    continue;
                }

                String[] c = line.split(",");
                if (c.length < 6)
                    continue;

                if (isGeneratedFormat) {
                    // Format: txn_date(0), description(1), merchant(2), amount(3), txn_type(4),
                    // balance(5)
                    Double amount = parseAmount(c[3]);
                    String type = c[4].trim().toUpperCase();

                    Double debit = "DEBIT".equals(type) ? amount : null;
                    Double credit = "CREDIT".equals(type) ? amount : null;

                    list.add(new TransactionRecord(
                            c[0], // txnDate
                            c[0], // using txnDate as valueDate fallback
                            c[2], // merchant as description
                            debit,
                            credit,
                            parseAmount(c[5]) // balance
                    ));
                } else {
                    // Legacy Format: Date(0), ValDate(1), Desc(2), Debit(3), Credit(4), Balance(5)
                    list.add(new TransactionRecord(
                            c[0], c[1], c[2],
                            parseAmount(c[3]),
                            parseAmount(c[4]),
                            parseAmount(c[5])));
                }
            }
        }
        return list;
    }

    private Double parseAmount(String value) {

        if (value == null)
            return null;

        value = value.trim();

        if (value.isEmpty() || value.equals("-")) {
            return null;
        }

        // Remove commas and non-numeric symbols except dot
        value = value.replaceAll(",", "")
                .replaceAll("[^0-9.]", "");

        if (value.isEmpty())
            return null;

        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Double getCellAsDouble(Row row, int index) {
        String value = getCellAsString(row, index);
        return parseAmount(value);
    }

    private String getCellAsString(Row row, int index) {
        if (row == null)
            return null;

        Cell cell = row.getCell(index);
        if (cell == null)
            return null;

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> null;
        };
    }

    public List<TransactionRecord> extractFromExcel(MultipartFile file) throws Exception {

        List<TransactionRecord> list = new ArrayList<>();

        Workbook wb = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = wb.getSheetAt(0);

        int headerRowIndex = -1;

        // 1️⃣ Find header row dynamically
        for (int i = 0; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null)
                continue;

            String cellValue = getCellAsString(row, 0);
            if ("Transaction Date".equalsIgnoreCase(cellValue)) {
                headerRowIndex = i;
                break;
            }
        }

        if (headerRowIndex == -1) {
            wb.close();
            throw new RuntimeException("Transaction header not found");
        }

        // 2️⃣ Start reading transactions after header
        for (int i = headerRowIndex + 1;; i++) {

            Row r = sheet.getRow(i);
            if (r == null)
                break;

            String txnDate = getCellAsString(r, 0);

            // Stop when transaction date is empty (A26 case)
            if (txnDate == null || txnDate.isBlank())
                break;

            list.add(new TransactionRecord(
                    txnDate, // Transaction Date (A23)
                    getCellAsString(r, 1), // Value Date
                    getCellAsString(r, 2), // Particulars
                    parseAmount(getCellAsString(r, 4)), // Debit
                    parseAmount(getCellAsString(r, 5)), // Credit
                    parseAmount(getCellAsString(r, 6)) // Balance
            ));
        }

        wb.close();
        return list;
    }

    public List<TransactionRecord> extractFromPdf(MultipartFile file) throws Exception {

        PDDocument document = PDDocument.load(file.getInputStream());
        PDFTextStripper stripper = new PDFTextStripper();
        String text = stripper.getText(document);

        List<TransactionRecord> records = new ArrayList<>();

        String[] lines = text.split("\\r?\\n");

        Pattern txnPattern = Pattern.compile(
                "(\\d{2}-[A-Za-z]{3}-\\d{4})\\s+" + // txn date
                        "(\\d{2}-[A-Za-z]{3}-\\d{4})\\s+" + // value date
                        "(.+?)\\s+" +
                        "(\\d+[,.]?\\d*)\\s+" + // debit
                        "(\\d+[,.]?\\d*)" // balance
        );

        for (String line : lines) {
            Matcher m = txnPattern.matcher(line);

            if (m.find()) {
                records.add(new TransactionRecord(
                        m.group(1),
                        m.group(2),
                        m.group(3),
                        parseAmount(m.group(4)),
                        null,
                        parseAmount(m.group(5))));
            }
        }

        document.close();
        return records;
    }

}
