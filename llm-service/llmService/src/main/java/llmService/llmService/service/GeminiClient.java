package llmService.llmService.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import llmService.llmService.dto.AiInsightRequest;
import llmService.llmService.dto.AiInsightResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;


@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiClient {


    private final WebClient webClient;
    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    public AiInsightResponse callGemini(String prompt) throws JsonProcessingException {

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts",
                                List.of(Map.of("text", prompt))
                        )
                )
        );

        String response = webClient.post()
                .uri(GEMINI_URL + "?key=" + apiKey)
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        log.info("RAW GEMINI RESPONSE ===> {}", response);
        return parseInsight(response);
    }


    public String buildPrompt(AiInsightRequest request) {

        ObjectMapper mapper = new ObjectMapper();
        String signalsJson = "";
        String nlpJson = "";

        try {
            signalsJson = mapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(request.getSignals());

            nlpJson = mapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(request.getNlpNotification());

        } catch (Exception e) {
            signalsJson = "{}";
            nlpJson = "{}";
        }

        return """
        You are an AI financial assistant for a regulated bank in India.
        You will receive anonymized spending summary data. 
        DO NOT mention personal information, DO NOT recommend loans, investments, or financial advisory.
        DO NOT scare the user. Keep tone supportive and factual.

        Your job:
        - Understand spending pattern
        - Identify whether spending is stable, slightly high, or risky
        - Provide helpful message
        - Prefer positive reinforcement unless an anomaly is clear
        - Use RBI compliant neutral language
        - Keep message short and simple

        Input Signals (do not expose exact data in output):
        %s

        Existing Rule-Based NLP Notification (use as fallback reference, but improve clarity):
        %s

        STRICT OUTPUT FORMAT ONLY (MANDATORY JSON):
        {
          "title": "short headline",
          "message": "clear user friendly explanation",
          "severity": "INFO | ALERT | CRITICAL",
          "confidence": "LOW | MEDIUM | HIGH",
          "category": "Grocery | Food | Travel | Utilities | Other"
        }
        """.formatted(signalsJson, nlpJson);
    }



    private AiInsightResponse parseInsight(String geminiResponse) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(geminiResponse);

        String llmText = root.path("candidates")
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText();

        // Remove markdown fences if present
        String cleaned = llmText
                .replace("```json", "")
                .replace("```", "")
                .trim();

        JsonNode node = mapper.readTree(cleaned);

        return AiInsightResponse.builder()
                .mode("EXTERNAL_LLM")
                .title(node.path("title").asText("Spending Insight"))
                .message(node.path("message").asText("Here is an update on your spending."))
                .severity(node.path("severity").asText("INFO"))
                .confidence(node.path("confidence").asText("MEDIUM"))
                .category(node.path("category").asText("Other"))
                .build();
    }


}
