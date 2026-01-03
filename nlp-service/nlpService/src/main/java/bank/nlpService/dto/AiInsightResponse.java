package bank.nlpService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiInsightResponse {
    private String mode;
    private String severity;
    private String title;
    private String message;
    private String confidence;
    private String category;
}
