package bank.insight.backend.controller;


import bank.insight.backend.dto.AiInsightRequest;
import bank.insight.backend.dto.AiInsightResponse;
import bank.insight.backend.service.AiInsightsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiInsightsController {

    @Autowired
    private AiInsightsService aiInsightsService;

    @PostMapping("/insight")
    public ResponseEntity<AiInsightResponse> generateAiInsight(@RequestBody AiInsightRequest request) {
        AiInsightResponse response = aiInsightsService.generateInsight(request);
        return ResponseEntity.ok(response);
    }

}
