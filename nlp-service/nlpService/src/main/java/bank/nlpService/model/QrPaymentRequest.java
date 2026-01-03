package bank.nlpService.model;

import lombok.Data;

@Data
public class QrPaymentRequest {
    private String merchant;
    private String upiId;
    private double amount;
    private String purpose;
}
