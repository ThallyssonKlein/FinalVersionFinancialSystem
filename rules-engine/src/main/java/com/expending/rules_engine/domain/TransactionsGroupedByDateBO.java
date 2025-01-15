package com.expending.rules_engine.domain;

import com.expending.rules_engine.domain.transaction.bo.Transaction;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class TransactionsGroupedByDateBO {
    private List<String> dates;
    private String date;
    private List<Transaction> transactions;
}
