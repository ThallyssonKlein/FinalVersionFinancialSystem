package com.expending.rules_engine.domain;

import com.expending.rules_engine.domain.config.bo.ConfigBO;
import com.expending.rules_engine.domain.transaction.bo.TransactionBO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class PairBO {
    private String pairName;
    private ConfigBO configBO;
    private List<TransactionBO> transactionBOS;
}
