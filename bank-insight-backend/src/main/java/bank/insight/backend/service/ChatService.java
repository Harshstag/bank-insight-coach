package bank.insight.backend.service;

import bank.insight.backend.dto.ChatMessage;
import bank.insight.backend.dto.ChatResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final GeminiClient geminiClient;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String NLP_CHAT_CONTEXT_URL = "http://localhost:8000/chat-context";

    /** Rolling in-memory conversation history (last MAX_HISTORY turns). */
    private final CopyOnWriteArrayList<ChatMessage> conversationHistory = new CopyOnWriteArrayList<>();
    private static final int MAX_HISTORY = 20; // 10 user + 10 assistant turns

    // ── System Prompt Template ──────────────────────────────────────────────
    private static final String SYSTEM_PROMPT_TEMPLATE = """
            You are FinPulse AI, a warm, professional, and RBI-compliant financial coach \
            embedded inside a personal banking app for Indian customers.

            Your role:
            - Help users understand their spending behaviour.
            - Answer questions about affordability (e.g., "Can I buy an AC?"), \
            savings goals, EMI planning, home loan readiness, and budget optimisation.
            - Recommend suitable financial products (credit cards, SIPs, insurance) \
            based on their actual spending — but only when clearly relevant and helpful.
            - Be conversational, friendly, and concise (2–4 sentences unless more depth is asked for).
            - Never expose raw transaction data verbatim.
            - Always use RBI-compliant, neutral, non-alarmist language.
            - Never guarantee investment returns or give legally binding financial advice.
            - If no statement data is available, politely ask the user to upload one.

            Currency: Indian Rupees (₹). All amounts are in INR.

            === CUSTOMER FINANCIAL CONTEXT (based on uploaded bank statement) ===
            %s
            === END CONTEXT ===
            """;

    // ── Public API ──────────────────────────────────────────────────────────

    /**
     * Process a user message:
     * 1. Fetch financial context from NLP service (RAG retrieval).
     * 2. Build grounded system prompt (RAG augmentation).
     * 3. Append user message to history.
     * 4. Call Gemini with full conversation history.
     * 5. Append assistant reply, trim history, return response.
     */
    public ChatResponse chat(String userMessage) {

        // ── Step 1: RAG Retrieval — fetch live financial context ─────────────
        String financialContextJson = fetchFinancialContext(userMessage);

        // ── Step 2: RAG Augmentation — inject context into system prompt ─────
        String systemPrompt = SYSTEM_PROMPT_TEMPLATE.formatted(financialContextJson);

        // ── Step 3: Append user turn ─────────────────────────────────────────
        conversationHistory.add(ChatMessage.builder()
                .role("user")
                .content(userMessage)
                .timestamp(Instant.now())
                .build());

        // ── Step 4: Call Gemini with full history + grounded system prompt ────
        String reply;
        try {
            // Pass a snapshot of the current history (thread-safe copy)
            List<ChatMessage> historySnapshot = List.copyOf(conversationHistory);
            reply = geminiClient.callGeminiChat(historySnapshot, systemPrompt);
        } catch (JsonProcessingException e) {
            log.error("Gemini chat call failed", e);
            reply = "I'm having a little trouble connecting right now. Please try again in a moment.";
        } catch (Exception e) {
            log.error("Unexpected error in ChatService", e);
            reply = "Something went wrong on my end. Please try again shortly.";
        }

        // ── Step 5: Append assistant turn & trim history ─────────────────────
        conversationHistory.add(ChatMessage.builder()
                .role("assistant")
                .content(reply)
                .timestamp(Instant.now())
                .build());

        trimHistory();

        return ChatResponse.builder()
                .reply(reply)
                .timestamp(Instant.now())
                .build();
    }

    public List<ChatMessage> getHistory() {
        return Collections.unmodifiableList(conversationHistory);
    }

    public void clearHistory() {
        conversationHistory.clear();
    }

    // ── Private Helpers ─────────────────────────────────────────────────────

    /**
     * Calls GET /chat-context on the Python NLP service and returns the
     * financial context as a pretty-printed JSON string for the system prompt.
     */
    @SuppressWarnings("unchecked")
    private String fetchFinancialContext(String userMessage) {
        try {
            String url = NLP_CHAT_CONTEXT_URL;
            if (userMessage != null && !userMessage.isBlank()) {
                url += "?query=" + userMessage;
            }
            Map<String, Object> context = restTemplate.getForObject(url, Map.class);
            if (context != null && context.containsKey("error")) {
                return "No bank statement has been uploaded yet. The user needs to upload their statement first.";
            }
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(context);
        } catch (Exception e) {
            log.warn("Could not fetch chat context from NLP service: {}", e.getMessage());
            return "Financial context unavailable. The NLP service may be starting up.";
        }
    }

    /** Keep history within MAX_HISTORY entries (FIFO — remove oldest pairs). */
    private void trimHistory() {
        while (conversationHistory.size() > MAX_HISTORY) {
            conversationHistory.remove(0);
        }
    }
}
