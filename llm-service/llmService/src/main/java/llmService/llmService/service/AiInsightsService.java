package llmService.llmService.service;

import llmService.llmService.dto.AiInsightRequest;
import llmService.llmService.dto.AiInsightResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;


@Slf4j
@Service
public class AiInsightsService {

    @Autowired
    private GeminiClient geminiClient;

    public AiInsightResponse generateInsight(AiInsightRequest request) {

        log.info("request :::::::: "+request);

        if (request.getConsent() == null || !request.getConsent()) {
            return AiInsightResponse.builder()
                    .mode("CONSENT_DISABLED")
                    .message("User has not provided consent for AI insights.")
                    .build();
        }

        try{
            String promt = geminiClient.buildPrompt(request);
            return geminiClient.callGemini(promt);

        }catch (Exception e){
            log.error("LLM ERROR ::::::::::::::::::: ", e);

            Map<String, Object> nlp = request.getNlpNotification();

            return AiInsightResponse.builder()
                    .mode("RULE_BASED_FALLBACK")
                    .severity((String)nlp.get("severity"))
                    .title((String)nlp.get("title"))
                    .message((String)nlp.get("message"))
                    .confidence((String)nlp.get("confidence"))
                    .category((String)nlp.get("category"))
                    .build();
        }
    }
}
