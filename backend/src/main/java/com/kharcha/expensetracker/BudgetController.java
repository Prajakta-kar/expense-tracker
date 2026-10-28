package com.kharcha.expensetracker;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    record BudgetRequest(@NotNull @Positive BigDecimal monthlyLimit) {}

    private final BudgetRepository budgets;
    private final UserRepository users;
    private final BudgetAlertService alerts;

    public BudgetController(BudgetRepository budgets, UserRepository users,
                            BudgetAlertService alerts) {
        this.budgets = budgets;
        this.users = users;
        this.alerts = alerts;
    }

    private Long currentUserId(Jwt jwt) {
        return users.findByEmail(jwt.getSubject())
                .map(User::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @GetMapping
    public Map<String, Object> get(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> body = new HashMap<>();
        body.put("monthlyLimit",
                budgets.findByUserId(currentUserId(jwt)).map(Budget::getMonthlyLimit).orElse(null));
        return body;
    }

    @PutMapping
    public Map<String, Object> save(@Valid @RequestBody BudgetRequest req,
                                    @AuthenticationPrincipal Jwt jwt) {
        Long userId = currentUserId(jwt);
        Budget budget = budgets.findByUserId(userId).orElseGet(() -> {
            Budget fresh = new Budget();
            fresh.setUserId(userId);
            return fresh;
        });
        budget.setMonthlyLimit(req.monthlyLimit());
        budget.setAlertedMonth(null); // a new limit can trigger a new alert
        budgets.save(budget);
        alerts.check(userId);
        return Map.of("monthlyLimit", budget.getMonthlyLimit());
    }

    @DeleteMapping
    public ResponseEntity<Void> remove(@AuthenticationPrincipal Jwt jwt) {
        budgets.findByUserId(currentUserId(jwt)).ifPresent(budgets::delete);
        return ResponseEntity.noContent().build();
    }
}