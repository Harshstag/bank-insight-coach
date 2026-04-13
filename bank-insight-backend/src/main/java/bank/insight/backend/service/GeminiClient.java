package bank.insight.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import bank.insight.backend.dto.AiInsightRequest;
import bank.insight.backend.dto.AiInsightResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiClient {

        private final WebClient webClient;
        @Value("${gemini.api.key}")
        private String apiKey;

        private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

        public AiInsightResponse callGemini(String prompt) throws JsonProcessingException {

                Map<String, Object> body = Map.of(
                                "contents", List.of(
                                                Map.of("parts",
                                                                List.of(Map.of("text", prompt)))));

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
                DO NOT mention personal information.
                DO NOT recommend loans, investments, investments, or financial advisory.
                DO NOT create urgency, fear, or pressure.
                Use RBI compliant neutral language.
                Keep tone supportive and factual.
                Keep message short (max 3–4 lines).

                Your job:
                - Understand spending pattern.
                - Identify whether spending is Stable, Slightly High, or Risky.
                - Identify dominant spending category.
                - Provide a helpful insight.
                - If naturally relevant, softly suggest a suitable IDFC FIRST credit card inside the message itself.
                - Suggest only one card.
                - Keep suggestion optional and non-promotional in tone.
                - Do not sound like a sales pitch.

                Credit Card Knowledge:
                - Fuel focused → IDFC FIRST Power Credit Card
                - Travel focused → IDFC FIRST Wealth / Mayura / Ashva / IndiGo / WOW
                - Grocery focused → IDFC FIRST Power / Hello Cashback
                - Entertainment → IDFC FIRST Millennia / Classic
                - Shopping → IDFC FIRST Select / Hello Cashback
                - EMI focused → IDFC FIRST SWYP
                - General rewards → IDFC FIRST Select / Wealth

                Input Signals (do not expose exact data in output):
                %s

                Existing Rule-Based NLP Notification (reference only):
                %s

                STRICT OUTPUT FORMAT ONLY (MANDATORY JSON):
                {
                "title": "short headline",
                "message": "clear user friendly explanation with optional soft card suggestion",
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
