package bank.nlpService.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsightsResponse {

    /**
     * Machine-readable behavioral signals
     * Example:
     * food_weekly_spend, food_spike_percent, total_weekly_spend
     */
    private Map<String, Object> signals;
    /**
     * Human-readable NLP / AI insight
     */
    @JsonProperty("nlpNotification")
    private bank.nlpService.dto.AiNotification aiNotification;
}