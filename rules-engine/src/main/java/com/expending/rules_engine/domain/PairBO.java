package com.expending.rules_engine.domain;

import com.expending.rules_engine.domain.config.bo.Config;
import com.expending.rules_engine.domain.transaction.bo.Transaction;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class PairBO {
    private String pairName;
    private Config config;
    private List<Transaction> transactions;
}
