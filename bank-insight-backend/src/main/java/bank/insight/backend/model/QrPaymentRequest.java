package bank.insight.backend.model;

import lombok.Data;

@Data
public class QrPaymentRequest {
    private String merchant;
    private String upiId;
    private double amount;
    private String purpose;
}
