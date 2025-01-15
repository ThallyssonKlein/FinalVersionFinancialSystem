package com.expending.rules_engine.domain;

import com.expending.rules_engine.domain.transaction.Transaction;
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
