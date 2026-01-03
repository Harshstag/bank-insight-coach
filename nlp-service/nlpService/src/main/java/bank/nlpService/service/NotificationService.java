package bank.nlpService.service;

import bank.nlpService.dto.AiInsightRequest;
import bank.nlpService.dto.AiInsightResponse;
import bank.nlpService.dto.AiNotification;
import bank.nlpService.dto.InsightsResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class NotificationService {

    private final CopyOnWriteArrayList<AiNotification> store = new CopyOnWriteArrayList<>();
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String NLP_URL = "http://localhost:8000/nlpNotification";
    private static final String LLM_URL = "http://localhost:8082/api/ai/insight";

    public List<AiNotification> findLastN(int n) {
        int size = store.size();
        if (n <= 0 || size == 0) return List.of();
        int from = Math.max(0, size - n);
        return List.copyOf(store.subList(from, size));
    }

    public AiNotification fetchNotification(boolean consent) {

        // 1️⃣ Call NLP microservice ALWAYS
        InsightsResponse nlpResponse =
                restTemplate.getForObject(NLP_URL, InsightsResponse.class);

        AiNotification nlpNotification =
                nlpResponse != null ? nlpResponse.getAiNotification() : null;

        Map<String, Object> signals =
                nlpResponse != null ? nlpResponse.getSignals() : null;

        if (nlpNotification == null) return null;

        // 2️⃣ If no consent → return NLP only
        if (!consent) {
            save(nlpNotification);
            return nlpNotification;
        }

        // 3️⃣ Consent true → Try call LLM
        try {
            AiInsightRequest request = new AiInsightRequest();
            request.setConsent(true);
            request.setSignals(signals);
            request.setNlpNotification(Map.of(
//                    "mode", nlpNotification.getMode(),
                    "title", nlpNotification.getTitle(),
                    "message", nlpNotification.getMessage(),
                    "severity", nlpNotification.getSeverity(),
                    "confidence", nlpNotification.getConfidence()
            ));

            AiInsightResponse llm =
                    restTemplate.postForObject(LLM_URL, request, AiInsightResponse.class);

            if (llm != null) {
                AiNotification notification = convertToAiNotification(llm);
                save(notification);
                return notification;
            }

        } catch (Exception e) {
            log.error("LLM SERVICE FAILED", e);

        }

        // 4️⃣ Fallback
        save(nlpNotification);
        return nlpNotification;
    }

    private AiNotification convertToAiNotification(AiInsightResponse r) {
        AiNotification n = new AiNotification();
        n.setMode(r.getMode() != null ? r.getMode() : "EXTERNAL_LLM");
        n.setTitle(r.getTitle());
        n.setMessage(r.getMessage());
        n.setSeverity(r.getSeverity());
        n.setConfidence(r.getConfidence());
        return n;
    }

    public void save(AiNotification notification) {
        if (notification != null) store.add(notification);
    }

    public List<AiNotification> findAll() {
        return List.copyOf(store);
    }
}
