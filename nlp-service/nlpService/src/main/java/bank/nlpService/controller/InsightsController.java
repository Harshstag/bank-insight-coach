package bank.nlpService.controller;

import bank.nlpService.dto.AiNotification;
import bank.nlpService.dto.InsightsResponse;
import bank.nlpService.service.NotificationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/api/insights")
public class InsightsController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/latestNlpNotification")
    public ResponseEntity<AiNotification> fetchNlpNotification() {
        RestTemplate restTemplate = new RestTemplate();
        InsightsResponse response = restTemplate.getForObject(
                "http://localhost:8000/nlpNotification",
                InsightsResponse.class
        );

        AiNotification ai = response != null ? response.getAiNotification() : null;

        if (ai == null) {
            ai = AiNotification.builder()
                    .mode("RULE_BASED")
                    .severity("WARNING")
                    .title("High Food Spending")
                    .message("High food spending detected this week")
                    .confidence("HIGH")
                    .build();
        }

        // Save the fetched/constructed notification so list endpoints return data
        notificationService.save(ai);
//        LOG.info("Saved NLP notification: " + (ai != null ? ai.getTitle() : "null"));

        return ResponseEntity.ok(ai);
    }

    @GetMapping("/allNlpNotifications")
    public ResponseEntity<List<AiNotification>> getAllNlpNotifications() {
        return ResponseEntity.ok(notificationService.findAll());
    }

    @GetMapping("/last5NlpNotifications")
    public ResponseEntity<List<AiNotification>> getLast5NlpNotifications() {
        return ResponseEntity.ok(notificationService.findLastN(5));
    }

    @GetMapping("/nlp/last/{count}")
    public ResponseEntity<List<AiNotification>> getLastNlpNotifications(@PathVariable int count) {
        return ResponseEntity.ok(notificationService.findLastN(count));
    }
}