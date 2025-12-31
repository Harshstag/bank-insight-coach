package com.bank.insights.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiNotification {

    /**
     * RULE_BASED | LLM
     * Helps UI label the insight source
     */
    private String mode;

    /**
     * INFO | WARNING | CRITICAL
     * Used for UI colors and alerts
     */
    private String severity;

    /**
     * Short heading for notification
     * Example: "High Food Spending"
     */
    private String title;

    /**
     * Human-readable message
     */
    private String message;

    /**
     * HIGH | MEDIUM | LOW
     * Important when LLM is introduced
     */
    private String confidence;
}