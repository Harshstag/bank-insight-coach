package com.bank.insights.service;
import com.bank.insights.dto.AiNotification;
import com.bank.insights.dto.InsightsResponse;
import com.bank.insights.dto.QrPaymentResponse;
import com.bank.insights.model.QrPaymentRequest;
import com.bank.insights.model.Transaction;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDate;
import java.util.UUID;

import org.springframework.web.reactive.function.client.WebClient;

@Service
public class PaymentService {

    // 📍 CSV path (same one used by Python engine

    private final Path csvPath;

    @Autowired
    private NotificationService notificationService;

    public PaymentService(
            @Value("${app.csv.path}") String csvPath
    ) {
        this.csvPath = Paths.get(csvPath).normalize();
        System.out.println("FINAL CSV PATH => " + this.csvPath.toAbsolutePath());
    }
    public QrPaymentResponse processQrPayment(QrPaymentRequest request) {

        Transaction txn = new Transaction(
                LocalDate.now().toString(),
                "QR PAYMENT",
                request.getMerchant(),
                request.getAmount(),
                "DEBIT",
                calculateBalance(request.getAmount())
        );

        appendTransactionToCsv(txn);
        AiNotification notification = notificationService.fetchNlpNotification();

        return QrPaymentResponse.builder()
                .transactionId(UUID.randomUUID().toString())
                .transaction(txn)
                .status("SUCCESS")
                .aiNotification(notification)
                .build();
    }

    private void appendTransactionToCsv(Transaction txn) {
        try {
            Files.createDirectories(csvPath.getParent());

            boolean exists = Files.exists(csvPath);

            try (BufferedWriter writer = Files.newBufferedWriter(
                    csvPath,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.APPEND
            )) {

                if (!exists) {
                    writer.write("txn_date,description,merchant,amount,txn_type,balance");
                    writer.newLine();
                }

                writer.write(String.join(",",
                        txn.getTxnDate(),
                        txn.getDescription(),
                        txn.getMerchant(),
                        String.valueOf(txn.getAmount()),
                        txn.getTxnType(),
                        String.valueOf(txn.getBalance())
                ));
                writer.newLine();
            }

        } catch (Exception e) {
            throw new RuntimeException("CSV write failed", e);
        }
    }
    // -----------------------------------------
    // SIMULATED BALANCE (DEMO ONLY)
    // -----------------------------------------
    // java
    private double calculateBalance(double debitAmount) {
        double lastBalance = 0.0;

        try {
            // If CSV does not exist, assume opening balance
            if (!Files.exists(csvPath)) {
                return 60000 - debitAmount; // demo opening balance
            }

            try (BufferedReader reader = Files.newBufferedReader(csvPath, StandardCharsets.UTF_8)) {
                String line;
                boolean isHeader = true;

                while ((line = reader.readLine()) != null) {
                    if (isHeader) {
                        isHeader = false;
                        continue;
                    }

                    String[] cols = line.split(",");

                    // balance column index = 5
                    if (cols.length > 5) {
                        try {
                            lastBalance = Double.parseDouble(cols[5].trim());
                        } catch (NumberFormatException e) {
                            // Ignore malformed balance rows
                        }
                    }
                }
            }

        } catch (IOException e) {
            // On IO failure, fallback to opening balance
            lastBalance = 60000;
        }

        return lastBalance - debitAmount;
    }

}
