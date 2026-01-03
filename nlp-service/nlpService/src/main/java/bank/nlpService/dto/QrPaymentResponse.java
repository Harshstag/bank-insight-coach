package bank.nlpService.dto;


import bank.nlpService.model.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QrPaymentResponse {

    /**
     * Unique transaction reference
     */
    private String transactionId;

    /**
     * Transaction object (no category here)
     * Category handled by Python Insights Engine
     */
    private Transaction transaction;

    /**
     * SUCCESS | FAILED
     */
    private String status;

    /**
     * AI / NLP notification shown immediately after payment
     */
    private AiNotification aiNotification;
}