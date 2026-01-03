package bank.nlpService.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Transaction {

    private String txnDate;
    private String description;
    private String merchant;
    private Double amount;
    private String txnType;
    private Double balance;
}
