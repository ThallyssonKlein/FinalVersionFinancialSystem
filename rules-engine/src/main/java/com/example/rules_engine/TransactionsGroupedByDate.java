package com.example.rules_engine;

import com.example.rules_engine.transaction.Transaction;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TransactionsGroupedByDate {
    private List<String> dates;
    private String date;
    private List<Transaction> transactions;
}
