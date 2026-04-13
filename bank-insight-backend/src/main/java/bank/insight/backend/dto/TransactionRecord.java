package bank.insight.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionRecord {

    private String txnDate;
    private String valueDate;
    private String description;
    private Double debit;
    private Double credit;
    private Double balance;
}
