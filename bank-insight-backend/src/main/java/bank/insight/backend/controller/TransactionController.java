package bank.insight.backend.controller;

import bank.insight.backend.dto.TransactionRecord;
import bank.insight.backend.service.StatementExtractionService;
import bank.insight.backend.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private StatementExtractionService extractionService;

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping("/uploadV01")
    public ResponseEntity<String> uploadCsv(@RequestParam("file") MultipartFile file)
            throws IOException {
        // 1️⃣ Create uploads folder if not exists
        File uploadDir = new File(UPLOAD_DIR);

        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        } // 2️⃣ Save file locally

        Path filePath = Paths.get(UPLOAD_DIR + "transactions.csv");
        Files.write(filePath, file.getBytes());

        return ResponseEntity.ok("File uploaded successfully");
    }

    @GetMapping("/insights")
    public String getInsights() {
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.getForObject(
                "http://localhost:8000/insights",
                String.class);
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadStatement(
            @RequestParam("file") MultipartFile file) throws Exception {

        String filename = file.getOriginalFilename().toLowerCase();

        List<TransactionRecord> records;

        if (filename.endsWith(".csv")) {
            records = extractionService.extractFromCsv(file);
        } else if (filename.endsWith(".xlsx")) {
            records = extractionService.extractFromExcel(file);
        } else if (filename.endsWith(".pdf")) {
            records = extractionService.extractFromPdf(file);
        } else {
            return ResponseEntity.badRequest()
                    .body("Invalid file type. Please upload a CSV, Excel, or PDF file.");
        }

        // Create uploads folder if not exists (reusing logic from uploadV01)
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        Path outputPath = Paths.get(UPLOAD_DIR + "transactions.csv");

        StringBuilder csvContent = new StringBuilder();
        // Header: txn_date,description,merchant,amount,txn_type,balance
        csvContent.append("txn_date,description,merchant,amount,txn_type,balance\n");

        for (TransactionRecord record : records) {
            String txnDate = record.getTxnDate() != null ? record.getTxnDate() : "";
            // description is requested to be null/empty
            String description = "";
            // merchant comes from record description
            String merchant = record.getDescription() != null ? record.getDescription().replace(",", " ") : ""; // escaping
                                                                                                                // comma
                                                                                                                // just
                                                                                                                // in
                                                                                                                // case

            Double amount = null;
            String txnType = "";

            if (record.getDebit() != null && record.getDebit() > 0) {
                amount = record.getDebit();
                txnType = "DEBIT";
            } else if (record.getCredit() != null && record.getCredit() > 0) {
                amount = record.getCredit();
                txnType = "CREDIT";
            } else {
                // strict logic: if both are null or 0, maybe NO_AFFECT? Or Just 0.
                // User said "covert debit credit using unll or the value convert it to
                // txn_type"
                // Assuming priority to debit if both exist (rare) or handles separate columns.
                amount = 0.0;
            }

            // String formattedAmount = amount != null ? String.valueOf(amount) : "";
            String formattedAmount = String.valueOf(amount);

            Double balance = record.getBalance();
            String formattedBalance = balance != null ? String.valueOf(balance) : "";

            csvContent.append(txnDate).append(",")
                    .append(description).append(",")
                    .append(merchant).append(",")
                    .append(formattedAmount).append(",")
                    .append(txnType).append(",")
                    .append(formattedBalance).append("\n");
        }

        Files.write(outputPath, csvContent.toString().getBytes());

        return ResponseEntity.ok("File uploaded successfully");
    }

}
