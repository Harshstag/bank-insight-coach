package bank.insight.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    /** "user" or "assistant" */
    private String role;

    private String content;

    @Builder.Default
    private Instant timestamp = Instant.now();
}
