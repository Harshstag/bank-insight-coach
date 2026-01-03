package bank.nlpService.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Map;

@Data
public class AiInsightRequest {

    @JsonProperty("consent")
    private Boolean consent;

    private Map<String, Object> signals;
    private Map<String, Object> nlpNotification;
}

