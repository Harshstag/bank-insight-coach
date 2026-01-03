package llmService.llmService.controller;


import llmService.llmService.dto.AiInsightRequest;
import llmService.llmService.dto.AiInsightResponse;
import llmService.llmService.service.AiInsightsService;
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
