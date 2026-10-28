package com.kharcha.expensetracker;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    record RegisterRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6) String password) {}

    record LoginRequest(@NotBlank String email, @NotBlank String password) {}

    record AuthResponse(String token, String name, String email) {}

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtEncoder jwtEncoder;
    private final EmailService email;

    public AuthController(UserRepository users, PasswordEncoder encoder,
                          JwtEncoder jwtEncoder, EmailService email) {
        this.users = users;
        this.encoder = encoder;
        this.jwtEncoder = jwtEncoder;
        this.email = email;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        String address = req.email().trim().toLowerCase();
        if (users.existsByEmail(address)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "This email is already registered"));
        }
        User user = new User();
        user.setName(req.name().trim());
        user.setEmail(address);
        user.setPassword(encoder.encode(req.password()));
        users.save(user);

        sendWelcome(user);

        return ResponseEntity.ok(new AuthResponse(createToken(user), user.getName(), user.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        String address = req.email().trim().toLowerCase();
        User user = users.findByEmail(address).orElse(null);
        if (user == null || !encoder.matches(req.password(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }
        return ResponseEntity.ok(new AuthResponse(createToken(user), user.getName(), user.getEmail()));
    }

    private void sendWelcome(User user) {
        String html = "<div style=\"font-family:Arial,sans-serif;max-width:480px\">"
                + "<h2 style=\"color:#5b3df5\">Welcome to Kharcha</h2>"
                + "<p>Hi " + escape(user.getName()) + ",</p>"
                + "<p>Your account is ready. Here is what you can do:</p>"
                + "<ul>"
                + "<li>Log your expenses in seconds</li>"
                + "<li>See where your money goes on the dashboard</li>"
                + "<li>Set a monthly budget, and we will email you if you go over it</li>"
                + "</ul>"
                + "<p>Happy tracking!</p></div>";
        email.send(user.getEmail(), user.getName(), "Welcome to Kharcha", html);
    }

    private static String escape(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;");
    }

    private String createToken(User user) {
        Instant now = Instant.now();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(user.getEmail())
                .issuedAt(now)
                .expiresAt(now.plus(1, ChronoUnit.DAYS))
                .build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}