package com.bank.insights.controller;
import com.bank.insights.dto.AiNotification;
import com.bank.insights.dto.InsightsResponse;
import com.bank.insights.dto.QrPaymentResponse;
import com.bank.insights.model.QrPaymentRequest;
import com.bank.insights.model.Transaction;
import com.bank.insights.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.bank.insights.service.PaymentService;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class QrPaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/qr")
    public ResponseEntity<?> payViaQr(@RequestBody QrPaymentRequest request) {

        QrPaymentResponse qrResponse = paymentService.processQrPayment(request);

        Map<String, Object> response = new HashMap<>();
        response.put("status", qrResponse.getStatus() != null ? qrResponse.getStatus() : "SUCCESS");
        response.put("transactionId", qrResponse.getTransactionId() != null ? qrResponse.getTransactionId() : UUID.randomUUID().toString());
        response.put("transaction", qrResponse.getTransaction());

        AiNotification ai = qrResponse.getAiNotification();

        // if service didn't return one, attempt to fetch directly
        if (ai == null) {
            ai = notificationService.fetchNlpNotification();
        }

        // final fallback default
        if (ai == null) {
            ai = AiNotification.builder()
                    .mode("RULE_BASED")
                    .severity("WARNING")
                    .title("High Food Spending")
                    .message("High food spending detected this week")
                    .confidence("HIGH")
                    .build();
        }

        response.put("aiNotification", ai);

        return ResponseEntity.ok(response);
    }

}
