package bank.nlpService.controller;

import bank.nlpService.dto.AiNotification;
import bank.nlpService.dto.QrPaymentResponse;
import bank.nlpService.model.QrPaymentRequest;
import bank.nlpService.service.NotificationService;
import bank.nlpService.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
        AiNotification aiNotification = qrResponse.getAiNotification();


        // final fallback default
        if (aiNotification == null) {
            aiNotification = AiNotification.builder()
                    .mode("RULE_BASED")
                    .severity("WARNING")
                    .title("High Food Spending")
                    .message("High food spending detected this week")
                    .confidence("HIGH")
                    .build();
        }

        response.put("aiNotification", aiNotification);

        return ResponseEntity.ok(response);
    }

}
