package com.kharcha.expensetracker;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final RestClient client = RestClient.create();

    @Value("${brevo.api-key:}")
    private String apiKey;

    @Value("${brevo.sender-email:}")
    private String senderEmail;

    @Value("${brevo.sender-name:Kharcha}")
    private String senderName;

    /** Sends in the background, so a slow or failed email never blocks the app. */
    public void send(String toEmail, String toName, String subject, String html) {
        if (apiKey.isBlank() || senderEmail.isBlank()) {
            log.warn("Email not sent: the Brevo settings are missing");
            return;
        }
        CompletableFuture.runAsync(() -> {
            try {
                client.post()
                        .uri("https://api.brevo.com/v3/smtp/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("api-key", apiKey)
                        .header("accept", "application/json")
                        .body(Map.of(
                                "sender", Map.of("name", senderName, "email", senderEmail),
                                "to", List.of(Map.of("email", toEmail, "name", toName)),
                                "subject", subject,
                                "htmlContent", html))
                        .retrieve()
                        .toBodilessEntity();
                log.info("Email sent to {}", toEmail);
            } catch (Exception e) {
                log.error("Could not send email: {}", e.getMessage());
            }
        });
    }
}