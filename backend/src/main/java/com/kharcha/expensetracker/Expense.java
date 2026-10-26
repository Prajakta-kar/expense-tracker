package com.kharcha.expensetracker;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
@Data
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotBlank
    private String category;

    @NotNull
    @Column(name = "expense_date")
    private LocalDate date;

    private String note;
}