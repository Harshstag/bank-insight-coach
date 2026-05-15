package bank.insight.backend.controller;

import bank.insight.backend.dto.ChatMessage;
import bank.insight.backend.dto.ChatRequest;
import bank.insight.backend.dto.ChatResponse;
import bank.insight.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    /**
     * POST /api/chat
     * Send a user message and receive an AI-generated reply.
     */
    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        log.info("Chat message received: {}", request.getUserMessage());
        if (request.getUserMessage() == null || request.getUserMessage().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        ChatResponse response = chatService.chat(request.getUserMessage());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/chat/history
     * Return the full in-memory conversation history.
     */
    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getHistory() {
        return ResponseEntity.ok(chatService.getHistory());
    }

    /**
     * DELETE /api/chat/history
     * Clear the in-memory conversation history (start a fresh session).
     */
    @DeleteMapping("/history")
    public ResponseEntity<Void> clearHistory() {
        chatService.clearHistory();
        log.info("Chat history cleared.");
        return ResponseEntity.noContent().build();
    }
}
