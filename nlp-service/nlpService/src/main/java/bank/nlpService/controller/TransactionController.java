package bank.nlpService.controller;


import bank.nlpService.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin
public class TransactionController {


    @Autowired
    private TransactionService transactionService;

                                                private static final String UPLOAD_DIR = "uploads/";

                                                @PostMapping("/upload")
                                                public ResponseEntity<String> uploadCsv(@RequestParam("file") MultipartFile file)
                                                        throws IOException {

                                                    // 1️⃣ Create uploads folder if not exists
                                                    File uploadDir = new File(UPLOAD_DIR);
                                                    if (!uploadDir.exists()) {
                                                        uploadDir.mkdirs();
                                                    }

                                                    // 2️⃣ Save file locally
                                                    Path filePath = Paths.get(UPLOAD_DIR + "transactions.csv");
                                                    Files.write(filePath, file.getBytes());

                                                    return ResponseEntity.ok("File uploaded successfully");
                                                }

    @GetMapping("/insights")
    public String getInsights() {
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.getForObject(
                "http://localhost:8000/insights",
                String.class
        );
    }

}
