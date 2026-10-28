package com.kharcha.expensetracker;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;

@Service
public class BudgetAlertService {

    private final BudgetRepository budgets;
    private final ExpenseRepository expenses;
    private final UserRepository users;
    private final EmailService email;

    public BudgetAlertService(BudgetRepository budgets, ExpenseRepository expenses,
                              UserRepository users, EmailService email) {
        this.budgets = budgets;
        this.expenses = expenses;
        this.users = users;
        this.email = email;
    }

    /** Sends one email per month, the first time spending goes over the budget. */
    public void check(Long userId) {
        Budget budget = budgets.findByUserId(userId).orElse(null);
        if (budget == null) return;

        YearMonth month = YearMonth.now();
        String key = month.toString();
        if (key.equals(budget.getAlertedMonth())) return;

        BigDecimal total = expenses.findByUserId(userId).stream()
                .filter(e -> YearMonth.from(e.getDate()).equals(month))
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (total.compareTo(budget.getMonthlyLimit()) <= 0) return;

        User user = users.findById(userId).orElse(null);
        if (user == null) return;

        budget.setAlertedMonth(key);
        budgets.save(budget);

        BigDecimal over = total.subtract(budget.getMonthlyLimit());
        String html = "<div style=\"font-family:Arial,sans-serif;max-width:480px\">"
                + "<h2 style=\"color:#5b3df5\">Kharcha budget alert</h2>"
                + "<p>Hi " + escape(user.getName()) + ",</p>"
                + "<p>You have gone over your monthly budget.</p>"
                + "<ul>"
                + "<li>Budget: &#8377;" + money(budget.getMonthlyLimit()) + "</li>"
                + "<li>Spent this month: &#8377;" + money(total) + "</li>"
                + "<li><b>Over by: &#8377;" + money(over) + "</b></li>"
                + "</ul>"
                + "<p>Open Kharcha to review your expenses.</p></div>";

        email.send(user.getEmail(), user.getName(),
                "You are over your monthly budget", html);
    }

    private static String money(BigDecimal value) {
        return String.format("%,.0f", value);
    }

    private static String escape(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;");
    }
}