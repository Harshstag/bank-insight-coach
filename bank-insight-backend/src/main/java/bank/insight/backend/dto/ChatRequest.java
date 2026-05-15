package bank.insight.backend.dto;

import lombok.Data;

@Data
public class ChatRequest {

    private String userMessage;

    /** If true, user has consented to sending data to the external LLM */
    private Boolean consent = true;
}
