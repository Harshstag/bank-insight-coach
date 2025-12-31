package com.bank.insights.service;

import com.bank.insights.dto.AiNotification;
import com.bank.insights.dto.InsightsResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationService {
    private final CopyOnWriteArrayList<AiNotification> store = new CopyOnWriteArrayList<>();


    public void save(AiNotification notification) {
        if (notification != null) {
            store.add(notification);
        }
    }

    public List<AiNotification> findAll() {
        return List.copyOf(store);
    }

    public List<AiNotification> findLastN(int n) {
        int size = store.size();
        if (n <= 0 || size == 0) return List.of();
        int from = Math.max(0, size - n);
        return List.copyOf(store.subList(from, size));
    }

    public AiNotification fetchNlpNotification() {
        RestTemplate restTemplate = new RestTemplate();
        InsightsResponse response = restTemplate.getForObject(
                "http://localhost:8000/nlpNotification",
                InsightsResponse.class
        );

        AiNotification ai = response != null ? response.getAiNotification() : null;

        // save real notifications for later retrieval
        if (ai != null) {
            save(ai);
        }

        return ai;
    }


    // -----------------------------------------
    // ASYNC PYTHON CALL (OPTIONAL, DEMO HOOK)
    // -----------------------------------------
    private void triggerInsightsRefreshAsync() {
        WebClient.create("http://localhost:8000")
                .post()
                .uri("/recalculate")
                .retrieve()
                .bodyToMono(Void.class)
                .subscribe(); // NON-BLOCKING
    }
}