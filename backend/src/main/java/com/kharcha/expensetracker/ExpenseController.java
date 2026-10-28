package com.kharcha.expensetracker;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseRepository repo;
    private final UserRepository users;
    private final BudgetAlertService alerts;

    public ExpenseController(ExpenseRepository repo, UserRepository users,
                             BudgetAlertService alerts) {
        this.repo = repo;
        this.users = users;
        this.alerts = alerts;
    }

    private Long currentUserId(Jwt jwt) {
        return users.findByEmail(jwt.getSubject())
                .map(User::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @GetMapping
    public List<Expense> getAll(@AuthenticationPrincipal Jwt jwt) {
        return repo.findByUserId(currentUserId(jwt));
    }

    @PostMapping
    public Expense create(@Valid @RequestBody Expense expense,
                          @AuthenticationPrincipal Jwt jwt) {
        Long userId = currentUserId(jwt);
        expense.setId(null);
        expense.setUserId(userId);
        Expense saved = repo.save(expense);
        alerts.check(userId);
        return saved;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> update(@PathVariable Long id,
                                          @Valid @RequestBody Expense updated,
                                          @AuthenticationPrincipal Jwt jwt) {
        Long userId = currentUserId(jwt);
        Optional<Expense> found = repo.findByIdAndUserId(id, userId);
        if (found.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Expense e = found.get();
        e.setTitle(updated.getTitle());
        e.setAmount(updated.getAmount());
        e.setCategory(updated.getCategory());
        e.setDate(updated.getDate());
        e.setNote(updated.getNote());
        Expense saved = repo.save(e);
        alerts.check(userId);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @AuthenticationPrincipal Jwt jwt) {
        Optional<Expense> found = repo.findByIdAndUserId(id, currentUserId(jwt));
        if (found.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        repo.delete(found.get());
        return ResponseEntity.noContent().build();
    }
}