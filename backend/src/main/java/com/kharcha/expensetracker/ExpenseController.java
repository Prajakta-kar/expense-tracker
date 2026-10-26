package com.kharcha.expensetracker;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:5173")
public class ExpenseController {

    private final ExpenseRepository repo;

    public ExpenseController(ExpenseRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Expense> getAll() {
        return repo.findAll();
    }

    @PostMapping
    public Expense create(@Valid @RequestBody Expense expense) {
        expense.setId(null);
        return repo.save(expense);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> update(@PathVariable Long id,
                                          @Valid @RequestBody Expense updated) {
        return repo.findById(id).map(e -> {
            e.setTitle(updated.getTitle());
            e.setAmount(updated.getAmount());
            e.setCategory(updated.getCategory());
            e.setDate(updated.getDate());
            e.setNote(updated.getNote());
            return ResponseEntity.ok(repo.save(e));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}